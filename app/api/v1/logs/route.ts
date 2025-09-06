import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { otelLogsTable } from '@/db/schema';
import {
  OTLPLogsRequest,
  OTLPResponse,
  keyValuesToObject,
  extractStringValue,
} from '@/types/otel';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const contentType = request.headers.get('content-type');
    let body: OTLPLogsRequest;

    if (contentType?.includes('application/json')) {
      body = await request.json();
    } else if (contentType?.includes('application/x-protobuf')) {
      // For protobuf format, we'd need to decode it
      // For now, we'll return an error for protobuf
      return NextResponse.json(
        { error: 'Protobuf format not yet supported. Please use JSON.' },
        { status: 415 }
      );
    } else {
      body = await request.json();
    }

    // Validate request
    if (!body.resourceLogs || !Array.isArray(body.resourceLogs)) {
      return NextResponse.json(
        { error: 'Invalid request: resourceLogs array is required' },
        { status: 400 }
      );
    }

    let totalLogsProcessed = 0;
    let rejectedLogRecords = 0;
    const errors: string[] = [];

    // Process each resource log
    for (const resourceLog of body.resourceLogs) {
      const resourceAttributes = keyValuesToObject(resourceLog.resource?.attributes);
      const serviceName = resourceAttributes['service.name'] || 'unknown';

      // Process each scope log
      for (const scopeLog of resourceLog.scopeLogs || []) {
        // Process each log record
        for (const logRecord of scopeLog.logRecords || []) {
          try {
            // Convert log attributes
            const logAttributes = keyValuesToObject(logRecord.attributes);

            // Convert timestamp to ISO string
            const timestamp = new Date(
              Number(BigInt(logRecord.timeUnixNano) / BigInt(1000000))
            ).toISOString();

            // Extract body text
            const bodyText = extractStringValue(logRecord.body);

            // Create the data object to store (matching the schema from the SQL example)
            const logData = {
              timeUnixNano: logRecord.timeUnixNano,
              severityNumber: logRecord.severityNumber || 0,
              severityText: logRecord.severityText || 'UNSPECIFIED',
              body: bodyText,
              attributes: logAttributes,
              resourceAttributes,
            };

            // Insert log into database with simplified schema
            await db.insert(otelLogsTable).values({
              trace_id: logRecord.traceId || 'unknown',
              timestamp,
              data: logData,
              servicename: serviceName,
            });

            totalLogsProcessed++;
          } catch (error) {
            rejectedLogRecords++;
            errors.push(`Failed to process log record: ${error}`);
            console.error('Error processing log record:', error);
          }
        }
      }
    }

    // Prepare response
    const response: OTLPResponse = {};

    if (rejectedLogRecords > 0) {
      response.partialSuccess = {
        rejectedLogRecords,
        errorMessage: errors.join('; '),
      };
    }

    console.log(`Processed ${totalLogsProcessed} logs, rejected ${rejectedLogRecords}`);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error processing logs:', error);
    return NextResponse.json(
      { error: 'Internal server error processing logs' },
      { status: 500 }
    );
  }
}

// OPTIONS method for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Bug0-Key',
    },
  });
}

