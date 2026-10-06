pipeline {
    agent any

    environment {
        PATH = "/opt/nodejs/bin:${env.PATH}"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out VisionLearn source code from GitHub...'
                checkout scm
            }
        }

        stage('Build') {
            steps {
                echo 'Building and validating VisionLearn frontend...'

                sh '''
                    echo "Node version:"
                    node -v
                    echo "NPM version:"
                    npm -v

                    cd frontend
                    npm ci
                    npm run build
                '''
            }
        }

        stage('Test / Validate') {
            steps {
                echo 'Validating VisionLearn backend JavaScript...'

                sh '''
                    node -v
                    node --check backend/server.js
                '''
            }
        }

        stage('Docker Build - Backend') {
            steps {
                echo 'Building VisionLearn backend Docker image...'

                sh '''
                    docker build \
                      -f Dockerfile.backend \
                      -t visionlearn-backend:build-${BUILD_NUMBER} .
                '''
            }
        }

        stage('Docker Build - Frontend') {
            steps {
                echo 'Building VisionLearn frontend Docker image...'

                sh '''
                    docker build \
                      -f Dockerfile.frontend \
                      -t visionlearn-frontend:build-${BUILD_NUMBER} .
                '''
            }
        }
    }

    post {
        success {
            echo 'VisionLearn CI pipeline completed successfully!'
        }

        failure {
            echo 'VisionLearn CI pipeline failed. Check the console output.'
        }

        always {
            echo "Pipeline result: ${currentBuild.currentResult}"
        }
    }
}
