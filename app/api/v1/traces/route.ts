import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { otelTracesTable } from '@/db/schema';
import { OTLPTracesRequest, OTLPResponse, keyValuesToObject } from '@/types/otel';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const contentType = request.headers.get('content-type');
    let body: OTLPTracesRequest;

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
    if (!body.resourceSpans || !Array.isArray(body.resourceSpans)) {
      return NextResponse.json(
        { error: 'Invalid request: resourceSpans array is required' },
        { status: 400 }
      );
    }

    let totalSpansProcessed = 0;
    let rejectedSpans = 0;
    const errors: string[] = [];

    // Process each resource span
    for (const resourceSpan of body.resourceSpans) {
      const resourceAttributes = keyValuesToObject(resourceSpan.resource?.attributes);
      const serviceName = resourceAttributes['service.name'] || 'unknown';

      // Process each scope span
      for (const scopeSpan of resourceSpan.scopeSpans || []) {
        // Process each span
        for (const span of scopeSpan.spans || []) {
          try {
            // Convert span attributes
            const spanAttributes = keyValuesToObject(span.attributes);

            // Calculate timestamp
            const startTime = BigInt(span.startTimeUnixNano);
            const timestamp = new Date(Number(startTime / BigInt(1000000))).toISOString();

            // Create the data object to store
            const spanData = {
              traceId: span.traceId,
              spanId: span.spanId,
              parentSpanId: span.parentSpanId || null,
              name: span.name,
              kind: span.kind,
              startTimeUnixNano: span.startTimeUnixNano,
              endTimeUnixNano: span.endTimeUnixNano,
              attributes: spanAttributes,
              resourceAttributes,
            };

            // Insert span into database with simplified schema
            await db.insert(otelTracesTable).values({
              trace_id: span.traceId,
              timestamp,
              data: spanData,
              servicename: serviceName,
            });

            totalSpansProcessed++;
          } catch (error) {
            rejectedSpans++;
            errors.push(`Failed to process span ${span.spanId}: ${error}`);
            console.error('Error processing span:', error);
          }
        }
      }
    }

    // Prepare response
    const response: OTLPResponse = {};

    if (rejectedSpans > 0) {
      response.partialSuccess = {
        rejectedSpans,
        errorMessage: errors.join('; '),
      };
    }

    console.log(`Processed ${totalSpansProcessed} spans, rejected ${rejectedSpans}`);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error processing traces:', error);
    return NextResponse.json(
      { error: 'Internal server error processing traces' },
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
      'Access-Control-Allow-Headers': 'Content-Type, X-Kubiks-Key',
    },
  });
}

