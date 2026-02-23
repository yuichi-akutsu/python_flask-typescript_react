#!/bin/bash
BUCKET=python-flask-typescript-react-cloudformation
STACK_NAME=dev-platform

# Package
aws cloudformation package \
  --template-file template.yaml \
  --s3-bucket $BUCKET \
  --output-template-file packaged.yaml

# Deploy
aws cloudformation deploy \
  --template-file packaged.yaml \
  --stack-name $STACK_NAME \
  --capabilities CAPABILITY_NAMED_IAM