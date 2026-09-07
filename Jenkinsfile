pipeline {
    agent any

    // Memanggil kedua environment sekaligus untuk digunakan di seluruh stage
    tools {
        nodejs 'NodeJS26' 
        go 'Go1.27'       
    }

    stages {
        stage('Checkout Code') {
            steps { checkout scm }
        }

        // ============================================================
        // TAHAP CI: Test & Lint (Berjalan di SEMUA branch & PR)
        // ============================================================
        stage('Backend: Test (CI)') {
            steps {
                dir('movie-app-backend') { 
                    sh '''
                        echo "=== Backend: Download dependencies ==="
                        go mod download

                        echo "=== Backend: Run tests ==="
                        go test ./... -v

                        echo "=== Backend: Build check ==="
                        go build -ldflags="-s -w" -o main .
                    '''
                }
            }
        }

        stage('Frontend: Test & Lint (CI)') {
            steps {
                dir('movie-app-frontend') { 
                    sh '''
                        echo "=== Frontend: Install dependencies ==="
                        npm install

                        echo "=== Frontend: Lint ==="
                        npm run lint

                        echo "=== Frontend: Build check ==="
                        npm run build
                    '''
                }
            }
        }

        // ============================================================
        // TAHAP CD: Deploy Production (HANYA berjalan di branch main)
        // ============================================================
        stage('Deploy Production (CD)') {
            when {
                branch 'main' 
            }
            steps {
                // Memanggil Secret File dari Jenkins Credentials
                withCredentials([
                    file(credentialsId: 'prod-movie-app-be-env', variable: 'SECRET_BE_ENV'),
                    file(credentialsId: 'prod-movie-app-fe-env', variable: 'SECRET_FE_ENV')
                ]) {
                    sh '''
                        echo "=== Menyiapkan Environment Variables ==="
                        # Mengkopi file secret dari memori Jenkins ke folder proyek masing-masing
                        cp $SECRET_BE_ENV ./movie-app-backend/.env
                        cp $SECRET_FE_ENV ./movie-app-frontend/.env

                        echo "=== Memulai deployment ke VPS ==="
                        docker compose -f docker-compose.prod.yml build
                        docker compose -f docker-compose.prod.yml up -d
                    '''
                }
            }
        }
        
        stage('Clean Up') {
            when {
                branch 'main'
            }
            steps {
                sh 'docker image prune -f'
            }
        }
    }
}
