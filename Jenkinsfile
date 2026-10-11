
pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    environment {
        PATH = "/opt/nodejs/bin:${env.PATH}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out VisionLearn from GitHub...'
                checkout scm
            }
        }

        stage('Environment Check') {
            steps {
                sh '''
                    set -eu
                    echo "Node: $(node -v)"
                    echo "npm: $(npm -v)"
                    echo "Git: $(git --version)"
                    echo "Docker: $(docker --version)"
                    echo "Disk space:"
                    df -h .
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        set -eu

                        if [ -f package-lock.json ]; then
                            npm ci --no-audit --no-fund
                        else
                            echo "No package-lock.json; using npm install."
                            npm install --no-audit --no-fund
                        fi

                        npm run build
                    '''
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh '''
                        set -eu

                        if [ -f package-lock.json ]; then
                            npm ci --no-audit --no-fund
                        else
                            npm install --no-audit --no-fund
                        fi
                    '''
                }
            }
        }

        stage('Test / Validate') {
            steps {
                sh '''
                    set -eu

                    echo "Checking backend syntax..."
                    node --check backend/server.js

                    echo "Checking frontend build output..."
                    test -d frontend/dist
                    test -f frontend/dist/index.html

                    echo "Running backend tests if configured..."
                    cd backend

                    if node -e "
                        const p = require('./package.json');
                        process.exit(p.scripts && p.scripts.test ? 0 : 1);
                    "; then
                        npm test -- --run
                    else
                        echo "No backend test script configured."
                        echo "Syntax and frontend build validations passed."
                    fi
                '''
            }
        }

        stage('Docker Build - Backend') {
            steps {
                sh '''
                    set -eu
                    docker build \
                      -f Dockerfile.backend \
                      -t visionlearn-backend:build-${BUILD_NUMBER} .
                '''
            }
        }

        stage('Docker Build - Frontend') {
            steps {
                sh '''
                    set -eu
                    docker build \
                      -f Dockerfile.frontend \
                      -t visionlearn-frontend:build-${BUILD_NUMBER} .
                '''
            }
        }

        stage('Verify Docker Images') {
            steps {
                sh '''
                    set -eu
                    docker image inspect \
                      visionlearn-backend:build-${BUILD_NUMBER}
                    docker image inspect \
                      visionlearn-frontend:build-${BUILD_NUMBER}
                '''
            }
        }
    }

    post {
        success {
            echo 'VisionLearn CI completed successfully.'
        }
        failure {
            echo 'CI failed. Check the first failing stage in Console Output.'
        }
        always {
            echo "Final pipeline result: ${currentBuild.currentResult}"
        }
    }
}
