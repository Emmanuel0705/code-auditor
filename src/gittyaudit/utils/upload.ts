import fs from "fs";
import lighthouse from "@lighthouse-web3/sdk";

export async function uploadJsonToFilecoin(jsonData: any) {
  // Write JSON to temporary file
  const tempPath = "code-review.json";
  fs.writeFileSync(tempPath, JSON.stringify(jsonData, null, 2));

  // Upload to Filecoin via Lighthouse
  const response = await lighthouse.upload(
    tempPath,
    process.env.LIGHTHOUSE_API_KEY
  );

  console.log("JSON uploaded successfully!");
  console.log("IPFS CID:", response.data.Hash);

  // Optionally remove temp file
  fs.unlinkSync(tempPath);

  return response;
}
