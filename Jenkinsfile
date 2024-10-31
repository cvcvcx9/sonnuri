pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh '''
                docker rmi -f main-app || true
                docker build -t main-app .
                '''
            }
        }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
                sh '''
                docker stop main-app-container || true
                docker rm main-app-container || true
                docker run -d --name main-app-container -p 8000:8000 main-app
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