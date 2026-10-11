
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
        
        stage('Deploy to EC2') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-visionlearn',
                        usernameVariable: 'DOCKERHUB_USER',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    ),
                    string(
                        credentialsId: 'visionlearn-jwt-secret',
                        variable: 'JWT_SECRET'
                    )
                ]) {
                    sh '''
                        set -eu

                        BACKEND_IMAGE="${DOCKERHUB_USER}/visionlearn-backend:build-${BUILD_NUMBER}"
                        FRONTEND_IMAGE="${DOCKERHUB_USER}/visionlearn-frontend:build-${BUILD_NUMBER}"

                        echo "Preparing deployment network and storage..."
                        docker network inspect visionlearn-net >/dev/null 2>&1 || \
                            docker network create visionlearn-net
                        docker volume inspect visionlearn-mongo-data >/dev/null 2>&1 || \
                            docker volume create visionlearn-mongo-data

                        echo "Ensuring MongoDB is running..."
                        if docker container inspect visionlearn-db >/dev/null 2>&1; then
                            docker start visionlearn-db >/dev/null 2>&1 || true
                            docker network connect visionlearn-net visionlearn-db >/dev/null 2>&1 || true
                        else
                            docker run -d \
                                --name visionlearn-db \
                                --network visionlearn-net \
                                --network-alias db \
                                --restart unless-stopped \
                                -v visionlearn-mongo-data:/data/db \
                                mongo:6.0
                        fi

                        echo "Pulling images for build ${BUILD_NUMBER}..."
                        docker pull "$BACKEND_IMAGE"
                        docker pull "$FRONTEND_IMAGE"

                        echo "Replacing application containers..."
                        docker rm -f visionlearn-frontend visionlearn-backend >/dev/null 2>&1 || true

                        docker run -d \
                            --name visionlearn-backend \
                            --network visionlearn-net \
                            --network-alias backend \
                            --restart unless-stopped \
                            -e PORT=5000 \
                            -e MONGODB_URI=mongodb://db:27017/visionlearn \
                            -e NODE_ENV=production \
                            -e JWT_SECRET="$JWT_SECRET" \
                            "$BACKEND_IMAGE"

                        docker run -d \
                            --name visionlearn-frontend \
                            --network visionlearn-net \
                            --restart unless-stopped \
                            -p 3000:80 \
                            "$FRONTEND_IMAGE"

                        echo "Waiting for backend readiness..."
                        BACKEND_OK=0
                        for i in $(seq 1 20); do
                            if docker exec visionlearn-backend node -e \
                                "fetch('http://localhost:5000').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
                            then
                                BACKEND_OK=1
                                break
                            fi
                            sleep 3
                        done
                        test "$BACKEND_OK" -eq 1

                        echo "Waiting for frontend readiness..."
                        FRONTEND_OK=0
                        for i in $(seq 1 20); do
                            CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ || true)
                            if [ "$CODE" = "200" ]; then
                                FRONTEND_OK=1
                                break
                            fi
                            sleep 3
                        done
                        test "$FRONTEND_OK" -eq 1

                        echo "Checking API proxy through Nginx..."
                        API_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/api/profile || true)
                        test "$API_CODE" = "401"

                        echo "Deployment verified successfully."
                        echo "Backend image: $BACKEND_IMAGE"
                        echo "Frontend image: $FRONTEND_IMAGE"
                        echo "Frontend URL: http://$(hostname -I | awk '{print $1}'):3000"
                        docker ps --filter name=visionlearn
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
