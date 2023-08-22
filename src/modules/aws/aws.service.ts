import { S3 } from 'aws-sdk';
import { Logger, Injectable } from '@nestjs/common';

@Injectable()
export class AwsService {
  async upload(file) {
    const { originalname, buffer } = file;
    const bucketS3 = 'fluctun';
    let res;
    try {
      res = await this.uploadS3(buffer, bucketS3, originalname);
    } catch (error) {
      return 'amazon error';
    }
    return res;
  }

  async uploadS3(file, bucket, name) {
    const s3 = this.getS3();
    const params = {
      Bucket: bucket,
      Key: String(name),
      Body: file,
      ContentType: file.mimetype,
    };
    return new Promise((resolve, reject) => {
      s3.upload({ ...params }, (err, data) => {
        if (err) {
          Logger.error(err);
          reject(err.message);
        }
        resolve(data);
      });
    });
  }

  getS3() {
    return new S3({
      accessKeyId: '******',
      secretAccessKey: '******',
    });
  }
}
