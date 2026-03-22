import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { randomUUID } from 'crypto'

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
})

const BUCKET = process.env.S3_BUCKET_NAME!

export async function uploadImage(buffer: Buffer, mimetype: string): Promise<string> {
    try {
        const key = `listings/${randomUUID()}`
        await s3.send(new PutObjectCommand({
            Bucket: BUCKET,
            Key: key,
            Body: buffer,
            ContentType: mimetype
        }))
        return `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
    } catch (error) {
        console.log("err uploadImage", error)
        throw error
    }
}

export async function deleteImage(url: string): Promise<void> {
    try {
        const key = url.split('.amazonaws.com/')[1]
        if (!key) return
        await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
    } catch (error) {
        console.log("err deleteImage", error)
        throw error
    }
}

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
        return getSignedUrl(s3, new PutObjectCommand({ Bucket: BUCKET, Key: key }), { expiresIn })
    } catch (error) {
        console.log("err getPresignedUrl", error)
        throw error
    }
}
