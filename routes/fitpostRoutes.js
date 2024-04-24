import { Router } from "express";
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const router = Router();

//not_secure
const BUCKET_NAME = "digidrobe";
const BUCKET_REGION = "us-east-2";
const ACCESS_KEY = "AKIA2UC3EQYTZS4TLAVG";
const SECRET_ACCESS_KEY = "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";

const s3 = new S3Client({
	credentials: {
		accessKeyId: ACCESS_KEY,
		secretAccessKey: SECRET_ACCESS_KEY,
	},
	region: BUCKET_REGION,
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
//! since i appended to /fitpost in index.js, i simply start with "/" here in fitpost routes
router
	.route("/")
	.get(async (req, res) => {
		res.render("fitposts", { title: "fitposts" });
	})
	.post(upload.single("image"), async (req, res) => {
		// console.log(req.body);
		console.log("req.file", req.file);
		req.file.buffer;
		const params = {
			Bucket: BUCKET_NAME,
			Key: req.file.originalname,
			Body: req.file.buffer,
			ContentType: req.file.mimetype,
		};
		const command = new PutObjectCommand(params);
		await s3.send(command);
		res.render("fitposts", { title: "fitposts" });
	});

export default router;
