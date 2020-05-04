docker-compose up -d db
cat april7.sql | docker exec -i tcf_db psql -U tcf_django tcf_db
docker-compose down
docker-compose up


# 1. docker-compose up -d db
# 2. cat april18.pgsql | docker exec -i tcf_db pg_restore -U tcf_django -d tcf_db
# 3. docker exec -it tcf_db psql -U tcf_django tcf_db
#     - delete from django_migrations where app!='contenttypes';
#     - ALTER TABLE django_content_type ADD COLUMN name character varying(50) NOT NULL DEFAULT 'someName';
# 4. rm -rf tcf_website/migrations/*
# 5. docker-compose up
