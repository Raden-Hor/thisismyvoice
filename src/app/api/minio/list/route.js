// app/api/minio/list/route.js (or pages/api/minio/list.js if using Pages Router)
import * as Minio from "minio";

const minioClient = new Minio.Client({
  endPoint: process.env.NEXT_PUBLIC_S3_URL,
  accessKey: process.env.NEXT_PUBLIC_MINIO_ACCESS_KEY,
  secretKey: process.env.NEXT_PUBLIC_MINIO_SECRET_KEY,
});

export async function GET() {
  try {
    const objects = [];

    return new Promise((resolve, reject) => {
      const stream = minioClient.listObjects(
        process.env.NEXT_PUBLIC_BUCKET_NAME,
        "",
        true
      );

      stream.on("data", function (obj) {
        objects.push(obj);
      });

      stream.on("end", async function () {
        objects.map(async (item) => {
          const presignedUrl = await minioClient.presignedGetObject(
            process.env.NEXT_PUBLIC_BUCKET_NAME,
            item.name,
            24 * 60 * 60
          );
          console.log(presignedUrl);
        });
        const objectsWithUrls = await Promise.all(
          objects.map(async (item) => {
            try {
              const presignedUrl = await minioClient.presignedGetObject(
                process.env.NEXT_PUBLIC_BUCKET_NAME,
                item.name,
                24 * 60 * 60
              );
              console.log(`Generated URL for ${item.name}:`, presignedUrl);

              return {
                ...item,
                url: presignedUrl,
              };
            } catch (error) {
              console.error(`Error generating URL for ${item.name}:`, error);
              return {
                ...item,
                url: `https://${process.env.NEXT_PUBLIC_S3_URL}/${process.env.NEXT_PUBLIC_BUCKET_NAME}/${item.name}`, // fallback
              };
            }
          })
        );

        resolve(Response.json({ success: true, objects: objectsWithUrls }));
      });

      stream.on("error", function (err) {
        console.error("Minio error:", err);
        reject(
          Response.json({ success: false, error: err.message }, { status: 500 })
        );
      });
    });
  } catch (error) {
    console.error("Error listing objects:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
