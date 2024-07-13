import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import { sql } from '@vercel/postgres';
import FileType from 'file-type';
import { fileTypeFromBuffer } from 'file-type';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const MONTHLY_UPLOAD_LIMIT = 50; // Adjustable
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  // Idk what else to allow
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

async function checkAndUpdateS3Usage(accountId: string): Promise<boolean> {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const result = await sql`
    SELECT count FROM s3_usage
    WHERE account_id = ${accountId} AND month = ${currentMonth} AND year = ${currentYear}
  `;

  if (result.rows.length === 0) {
    await sql`
      INSERT INTO s3_usage (account_id, month, year, count)
      VALUES (${accountId}, ${currentMonth}, ${currentYear}, 1)
    `;
    return true;
  }

  const currentCount = result.rows[0].count;

  if (currentCount >= MONTHLY_UPLOAD_LIMIT) {
    return false;
  }

  await sql`
    UPDATE s3_usage
    SET count = count + 1
    WHERE account_id = ${accountId} AND month = ${currentMonth} AND year = ${currentYear}
  `;

  return true;
}

async function validateFile(file: File | Buffer): Promise<boolean> {
  // Check file size
  const fileSize = file instanceof File ? file.size : file.length;
  if (fileSize > MAX_FILE_SIZE) {
    throw new Error('File size exceeds the maximum limit');
  }

  // Check file type
  const fileBuffer = file instanceof File ? await file.arrayBuffer() : file;
  const fileType = await fileTypeFromBuffer(Buffer.from(fileBuffer));

  if (!fileType || !ALLOWED_MIME_TYPES.includes(fileType.mime)) {
    throw new Error('Invalid file type');
  }

  return true;
}

export async function uploadToS3(file: File | Buffer, contentType: string, accountId: string): Promise<string> {
  if (!(await checkAndUpdateS3Usage(accountId))) {
    throw new Error('Monthly S3 upload limit reached');
  }

  await validateFile(file);

  const fileBuffer = file instanceof File ? await file.arrayBuffer() : file;
  const fileName = `${uuidv4()}-${file instanceof File ? file.name : 'file'}`;

  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: Buffer.from(fileBuffer),
    ContentType: contentType,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw new Error('Failed to upload file to S3');
  }
}

export async function deleteFromS3(fileUrl: string): Promise<void> {
  const fileName = fileUrl.split('/').pop();
  if (!fileName) {
    throw new Error('Invalid file URL');
  }

  const deleteParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(deleteParams));
  } catch (error) {
    console.error('Error deleting from S3:', error);
    throw new Error('Failed to delete file from S3');
  }
}