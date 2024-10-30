pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh '''
                sudo docker rmi -f test-app || true
                sudo docker build -t test-app .
                '''
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
                sh '''
                sudo docker stop test-app || true
                sudo docker rm test-app || true
                sudo docker run -d --name test-app -p 8000:8000 test-app
                '''
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