// Jenkinsfile
pipeline {
    agent any

    // -----------------------------
    // Environment Variables
    // -----------------------------
    environment {
        PORT = "5000"
        AWS_ACCESS_KEY_ID = credentials('aws-access-id')        // Jenkins secret text ID
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-id')    // Jenkins secret text ID
        AWS_BUCKET_NAME = "your_s3_bucket"                     // Can also be Jenkins credential
        DYNAMO_REGION = "ap-south-1"
        DYNAMO_TABLE_NAME = "users"
    }

    stages {
        // -----------------------------
        // Build Docker Image
        // -----------------------------
        stage('Build Docker Image') {
            steps {
                sh 'docker build -t student-portal-backend .'
            }
        }

        // -----------------------------
        // Run Docker Container
        // -----------------------------
        stage('Run Container') {
            steps {
                sh '''
                # Stop & remove old container if exists
                docker stop backend || true
                docker rm backend || true

                # Run new container with environment variables
                docker run -d -p 5000:5000 \
                    -e PORT=$PORT \
                    -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID \
                    -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY \
                    -e AWS_BUCKET_NAME=$AWS_BUCKET_NAME \
                    -e DYNAMO_REGION=$DYNAMO_REGION \
                    -e DYNAMO_TABLE_NAME=$DYNAMO_TABLE_NAME \
                    --name backend student-portal-backend
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Deployment successful!"
        }
        failure {
            echo "❌ Deployment failed!"
        }
    }
}