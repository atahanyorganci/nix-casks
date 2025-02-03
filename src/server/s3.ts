import type { PutObjectCommandInput } from "@aws-sdk/client-s3";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
	AWS_ACCESS_KEY_ID,
	AWS_BUCKET_NAME,
	AWS_ENDPOINT_URL_S3,
	AWS_REGION,
	AWS_SECRET_ACCESS_KEY,
} from "astro:env/server";

export const S3 = new S3Client({
	region: AWS_REGION,
	endpoint: AWS_ENDPOINT_URL_S3,
	credentials: {
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY,
	},
});

export function getUrl(key: string) {
	return `${AWS_ENDPOINT_URL_S3}/${AWS_BUCKET_NAME}/${key}`;
}

export async function uploadObject(input: Omit<PutObjectCommandInput, "Bucket" | "ContentType">) {
	const command = new PutObjectCommand({
		Bucket: AWS_BUCKET_NAME,
		ContentType: "application/json",
		...input,
	});
	const output = await S3.send(command);
	return output;
}
