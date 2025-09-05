import { NextRequest, NextResponse } from 'next/server';
import { Sandbox } from '@vercel/sandbox';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sandboxId: string }> }
) {
  try {
    const { sandboxId } = await params;
    const path = request.nextUrl.searchParams.get('path') || '';

    if (!sandboxId) {
      return NextResponse.json({ error: 'Missing sandboxId' }, { status: 400 });
    }
    if (!path) {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 });
    }

    const sandbox = await Sandbox.get({ sandboxId });

    // Use a POSIX-safe read via sh -lc to avoid issues with flags or spaces
    const escapedPath = `'${path.replace(/'/g, "'\\''")}'`;
    const cmd = await sandbox.runCommand({
      cmd: 'sh',
      args: ['-lc', `cat -- ${escapedPath}`],
    });

    const stdout = await cmd.stdout();
    const stderr = await cmd.stderr();
    const exitCode = await cmd.exitCode;

    if (exitCode !== 0) {
      // If file does not exist or is binary, return a helpful message
      const message = stderr?.trim() || 'Unable to read file';
      return new NextResponse(message, {
        status: 404,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    return new NextResponse(stdout ?? '', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error reading sandbox file:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
