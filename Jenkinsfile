pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                sh '''
                docker rmi -f test-app || true
                docker build -t test-app .
                '''
            }
        stage('Deploy') {
            steps {
                echo 'Deploying....'
                sh '''
                docker stop test-app || true
                docker rm test-app || true
                docker run -d --name test-app -p 8000:8000 test-app
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