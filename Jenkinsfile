pipeline {
    agent any
    environment {
        DETERMINE_PATH = 'determine'
        SONNURI_PATH = 'sonnuri'
    }

    stages {
        stage('Build and Run Determine') {
            when {
                changeset "${DETERMINE_PATH}/**" // determine 폴더에 변경 사항이 있을 때만 실행
            }
            steps {
                script {
                    // determine 디렉토리에서 Docker 빌드 및 실행
                    dir(DETERMINE_PATH) {
                        sh 'docker build -t determine_app .'
                        sh 'docker run -p 8001:8001 --rm determine_app'
                    }
                }
            }
        }
        stage('Build and Run Sonnuri') {
            when {
                changeset "${SONNURI_PATH}/**" // sonnuri 폴더에 변경 사항이 있을 때만 실행
            }
            steps {
                script {
                    // sonnuri 디렉토리에서 Docker 빌드 및 실행
                    dir(SONNURI_PATH) {
                        sh 'docker build -t sonnuri_app .'
                        sh 'docker run -p 8000:8000 --rm sonnuri_app'
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Build, package, and container run succeeded!'
        }
        failure {
            echo 'Build or container run failed.'
        }
    }
}