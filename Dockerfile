FROM python:3.8.6
COPY . /app/
WORKDIR /app
SHELL ["/bin/bash", "-o", "pipefail", "-c"]
RUN apt-get update && \
	curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
	apt-get install -y --no-install-recommends \
		libpq-dev \
		build-essential \
		unattended-upgrades \
		nodejs && \
	npm install && \
	pip3 install --no-cache-dir -r requirements.txt --disable-pip-version-check && \
	rm -rf /var/lib/apt/lists/*
