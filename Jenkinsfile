pipeline {
    agent any
    environment {
        DETERMINE_PATH = 'determine'
        ECCV_PATH = 'ECCV2022-RIFE'
        MORPHEME_PATH = 'morpheme'
    }

    stages {
        stage('Build and Run Determine') {
            when {
                changeset "${DETERMINE_PATH}/**" // determine 폴더에 변경 사항이 있을 때만 실행
            }
            steps {
                // Credentials 블록을 사용하여 MONGODB_ENV 파일을 환경변수로 가져오기
                withCredentials([
                    file(credentialsId: 'MONGODB_ENV', variable: 'MONGODB_ENV')
                ]) {
                    script {
                    // determine 컨테이너 중지 및 제거
                    sh 'docker stop determine_app || true && docker rm determine_app || true'
                    // 기존 determine_app 이미지 삭제
                    sh 'docker rmi determine_app || true'
                    // determine 디렉토리에서 Docker 빌드 및 실행
                    dir(DETERMINE_PATH) {
                        // .env 파일 처리
                        sh '''
                        if [ -f .env ]; then
                            chmod u+w .env
                        fi
                        '''
                        // Jenkins에 저장한 파일 복사
                        sh 'cp ${MONGODB_ENV} .env'
                        sh 'docker build -t determine_app .'
                        sh 'docker run -d --name determine_app --env-file .env -p 8001:8001 determine_app'
                        }
                    }
                }
            }
        }
        stage('Build and Run eccv') {
            when {
                changeset "${ECCV_PATH}/**" // ECCV2022-RIFE 폴더에 변경 사항이 있을 때만 실행
            }
            steps {
                // Credentials 블록을 사용하여 ECCV_ENV 파일을 환경변수로 가져오기
                withCredentials([
                    file(credentialsId: 'ECCV_ENV', variable: 'ECCV_ENV')
                ]) {
                    script {
                    // eccv_app 컨테이너 중지 및 제거
                    sh 'docker stop eccv_app || true && docker rm eccv_app || true'
                    // 기존 eccv_app 이미지 삭제
                    sh 'docker rmi eccv_app || true'
                    // sonnuri 디렉토리에서 Docker 빌드 및 실행
                    dir(ECCV_PATH) {
                        // .env 파일 처리
                        sh '''
                        if [ -f .env ]; then
                            chmod u+w .env
                        fi
                        '''
                        // Jenkins에 저장한 파일 복사
                        sh 'cp ${ECCV_ENV} .env'
                        sh 'docker build -t eccv_app .'
                        sh 'docker run -d --name eccv_app --env-file .env -p 8003:8003 eccv_app'
                        }
                    }
                }
            }
        }
        stage('Build and Run Morpheme') {
            when {
                changeset "${MORPHEME_PATH}/**" // morpheme 폴더에 변경 사항이 있을 때만 실행
            }
            steps {
                // Credentials 블록을 사용하여 MONGODB_ENV 파일을 환경변수로 가져오기
                withCredentials([
                    file(credentialsId: 'MONGODB_ENV', variable: 'MONGODB_ENV')
                ]) {
                    script {
                    // morpheme_app 컨테이너 중지 및 제거
                    sh 'docker stop morpheme_app || true && docker rm morpheme_app || true'
                    // 기존 morpheme_app 이미지 삭제
                    sh 'docker rmi morpheme_app || true'
                    // morpheme 디렉토리에서 Docker 빌드 및 실행
                    dir(MORPHEME_PATH) {
                        // .env 파일 처리
                        sh '''
                        if [ -f .env ]; then
                            chmod u+w .env
                        fi
                        '''
                        // Jenkins에 저장한 파일 복사
                        sh 'cp ${MONGODB_ENV} .env'
                        sh 'docker build -t morpheme_app .'
                        sh 'docker run -d --name morpheme_app --env-file .env -p 8005:8005 morpheme_app'
                        }
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