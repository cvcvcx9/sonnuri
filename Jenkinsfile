pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                script {
                    // determine 컨테이너 중지 및 제거
                    sh 'docker stop determine_app || true && docker rm determine_app || true'
                    // determine 디렉토리에서 Docker 빌드 및 실행
                    dir(DETERMINE_PATH) {
                        sh 'docker build -t determine_app .'
                        sh 'docker run -d -p 8001:8001 --rm determine_app'
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    // sonnuri 컨테이너 중지 및 제거
                    sh 'docker stop sonnuri_app || true && docker rm sonnuri_app || true'
                    // sonnuri 디렉토리에서 Docker 빌드 및 실행
                    dir(SONNURI_PATH) {
                        sh 'docker build -t sonnuri_app .'
                        sh 'docker run -d -p 8000:8000 --rm sonnuri_app'
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