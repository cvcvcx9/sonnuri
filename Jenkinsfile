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
                    // determine 컨테이너 중지 및 제거
                    sh 'docker stop determine_app || true && docker rm determine_app || true'
                    // 기존 determine_app 이미지 삭제
                    sh 'docker rmi determine_app || true'
                    // determine 디렉토리에서 Docker 빌드 및 실행
                    dir(DETERMINE_PATH) {
                        sh 'docker build -t determine_app .'
                        sh 'docker run -d --name determine_app -p 8001:8001 determine_app'
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
                    // sonnuri 컨테이너 중지 및 제거
                    sh 'docker stop sonnuri_app || true && docker rm sonnuri_app || true'
                    // 기존 sonnuri_app 이미지 삭제
                    sh 'docker rmi sonnuri_app || true'
                    // sonnuri 디렉토리에서 Docker 빌드 및 실행
                    dir(SONNURI_PATH) {
                        sh 'docker build -t sonnuri_app .'
                        sh 'docker run -d --name sonnuri_app -p 8000:8000 sonnuri_app'
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