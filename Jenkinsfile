
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

                    echo "Node.js: $(node -v)"
                    echo "npm: $(npm -v)"
                    echo "Git: $(git --version)"
                    echo "Docker: $(docker --version)"

                    echo "Available disk space:"
                    df -h .

                    echo "Repository structure:"
                    test -f frontend/package.json
                    test -f backend/package.json
                    test -f backend/server.js
                    test -f Dockerfile.backend
                    test -f Dockerfile.frontend

                    echo "Required files verified."
                '''
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        set -eu

                        echo "Installing frontend dependencies..."

                        if [ -f package-lock.json ]; then
                            npm ci --no-audit --no-fund
                        else
                            echo "No package-lock.json; using npm install."
                            npm install --no-audit --no-fund
                        fi

                        echo "Building frontend..."
                        npm run build

                        test -f dist/index.html
                        echo "Frontend build successful."
                    '''
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh '''
                        set -eu

                        echo "Installing backend dependencies..."

                        if [ -f package-lock.json ]; then
                            npm ci --no-audit --no-fund
                        else
                            npm install --no-audit --no-fund
                        fi

                        echo "Backend dependencies installed."
                    '''
                }
            }
        }

        stage('Test / Validate') {
            steps {
                sh '''
                    set -eu

                    echo "Checking backend JavaScript syntax..."
                    node --check backend/server.js

                    echo "Verifying frontend build..."
                    test -f frontend/dist/index.html

                    echo "Checking backend test configuration..."

                    if node -e "
                        const p = require('./backend/package.json');
                        process.exit(
                            p.scripts && p.scripts.test ? 0 : 1
                        );
                    "; then
                        echo "Backend test script found."
                        cd backend
                        npm test
                    else
                        echo "No backend test script configured."
                        echo "Backend syntax and frontend build checks passed."
                    fi

                    echo "Validation completed successfully."
                '''
            }
        }

        stage('Docker Build - Backend') {
            steps {
                sh '''
                    set -eu

                    echo "Building backend image..."

                    docker build \
                        -f Dockerfile.backend \
                        -t visionlearn-backend:build-${BUILD_NUMBER} .

                    echo "Backend image built successfully."
                '''
            }
        }

        stage('Docker Build - Frontend') {
            steps {
                sh '''
                    set -eu

                    echo "Building frontend image..."

                    docker build \
                        -f Dockerfile.frontend \
                        -t visionlearn-frontend:build-${BUILD_NUMBER} .

                    echo "Frontend image built successfully."
                '''
            }
        }

        stage('Verify Docker Images') {
            steps {
                sh '''
                    set -eu

                    echo "Verifying backend image..."
                    docker image inspect \
                        visionlearn-backend:build-${BUILD_NUMBER} \
                        > /dev/null

                    echo "Verifying frontend image..."
                    docker image inspect \
                        visionlearn-frontend:build-${BUILD_NUMBER} \
                        > /dev/null

                    echo "Built image tags:"
                    docker images --format '{{.Repository}}:{{.Tag}}' \
                        | grep -E '^visionlearn-(backend|frontend):build-' \
                        || true

                    echo "Docker image verification completed."
                '''
            }
        }
        
        stage('Push Images to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-visionlearn',
                        usernameVariable: 'DOCKERHUB_USER',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    )
                ]) {
                    sh '''
                        set -eu
        
                        BACKEND_LOCAL="visionlearn-backend:build-${BUILD_NUMBER}"
                        FRONTEND_LOCAL="visionlearn-frontend:build-${BUILD_NUMBER}"
        
                        BACKEND_REMOTE="${DOCKERHUB_USER}/visionlearn-backend:build-${BUILD_NUMBER}"
                        FRONTEND_REMOTE="${DOCKERHUB_USER}/visionlearn-frontend:build-${BUILD_NUMBER}"
        
                        echo "$DOCKERHUB_TOKEN" | docker login \
                            --username "$DOCKERHUB_USER" \
                            --password-stdin
        
                        docker tag "$BACKEND_LOCAL" "$BACKEND_REMOTE"
                        docker tag "$FRONTEND_LOCAL" "$FRONTEND_REMOTE"
        
                        docker push "$BACKEND_REMOTE"
                        docker push "$FRONTEND_REMOTE"
        
                        docker logout
        
                        echo "Successfully pushed:"
                        echo "$BACKEND_REMOTE"
                        echo "$FRONTEND_REMOTE"
                    '''
                }
            }
        }

    }

    post {
        success {
            echo 'VisionLearn CI completed successfully.'
        }

        failure {
            echo 'CI failed. Check Console Output for the first failing stage.'
        }

        always {
            echo "Final pipeline result: ${currentBuild.currentResult}"
        }
    }
}
