
# theCourseForum2
![version](https://img.shields.io/badge/version-1.0.0-blue.svg) [![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Build Status](https://travis-ci.com/thecourseforum/theCourseForum2.svg?branch=master)](https://travis-ci.com/thecourseforum/theCourseForum2) [![GitHub issues open](https://img.shields.io/github/issues/thecourseforum/theCourseForum2.svg?maxAge=2592000)]() [![GitHub issues closed](https://img.shields.io/github/issues-closed-raw/thecourseforum/theCourseForum2.svg?maxAge=2592000)]()

2020 Django rewrite of [theCourseForum 1.0](https://github.com/thecourseforum/theCourseForum) website at [thecourseforum.com](https://thecourseforum.com/).

[Dev](http://thecourseforum-dev.herokuapp.com/) | [Prod](https://thecourseforum.com/)

## Table of Contents
* [How To Contribute](#how-to-contribute)
* [Setup](#setup)
* [Common Issues & Fixes](#common-issues-and-fixes)
* [Site Update Guides](#site-update-guides)


## How to Contribute
If you are part of theCourseForum engineering team, follow the instructions below to create a PR for your feature branch. If you are a UVA student and would like to contribute, contact one of the current contributors.

### Directions
1. Create a new branch to do your work in off of the `dev` branch.
    - `git pull`
    - `git checkout dev`
    - `git checkout -B your_branch_name`
2. Make your changes!
3. Write unit tests and put them in `tcf_website/tests/`
4. Lint and test locally before commit:
    - `./precommit`
    - Fix any problems indicated by tests or pylint.
        - `docker exec tcf_django python3 manage.py test`
        - `docker exec tcf_django pylint --load-plugins pylint_django tcf_website tcf_core`
4. Stage your changes with `git add .`
5. Commit with `git commit -m "Add X feature."`
6. Push! `git push`
7. Make a PR (Pull Request) to merge your changes back into the `dev` branch.
8. Wait for all tests to pass on Travis (indicated by green checkmark).
9. Request an approver.
10. Wait to be approved and merged!

### Design Philosophies
- Thick models, thin views, thinner templates
    - most application logic should be in methods on model classes.
        - this ensures that the code can be reused easily anywhere the model is used and is way easier to test.
    - furthermore, you should avoid placing logic in templates.
        - e.g. don't filter lists in templates, filter them in the views.


## Setup
### MacOS and Linux Setup
1. Install git, docker, and docker-compose
    - https://git-scm.com/book/en/v2/Getting-Started-Installing-Git
    - https://docs.docker.com/install/
    - https://docs.docker.com/compose/install/
2. Clone the git repository and cd into the project folder
    ```
        git clone https://github.com/thecourseforum/theCourseForum2.git
        cd theCourseForum2
    ```
3. Copy the [project secret keys](https://docs.google.com/document/d/1HsuJOf-5oZljQK_k02CQhFbqw1q-pD_1-mExvyC1TV0/edit?usp=sharing) into a `.env` file in the project base directory `theCourseForum2/`
4. In the `theCourseForum2/` directory, run `docker-compose up` to start your Docker containers (tCF Django app and database)
5. Download a copy of the database from [Google Drive](https://drive.google.com/file/d/1S9GNFydvw6ZZW0AGHy6zyTLl-pvyIT8Q/view?usp=sharing)
    - put this into the base `theCourseForum2/` directory
6. Once the Django server is done loading (i.e. when you see `tcf_django | Watching for file changes with StatReloader`), open a second terminal, cd into `theCourseForum2/`, and run the following two lines of script to set up your database, one at a time:
    ```
    docker exec -i tcf_db psql tcf_db -U tcf_django -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    docker exec -i tcf_db psql tcf_db -U tcf_django < db_dump_file.sql
    ```
    where `db_dump_file.sql` should be replaced with the latest DB file (e.g. `launch.sql`)
7. Go to http://localhost:8000 in your browser and make sure everything works!

### Windows setup (recommended)
1. Install [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
2. Find your Windows version by looking for `System Information` in your settings.
    - If you're using Windows 10 Pro, Enterprise, or Education, then follow [these instructions](https://docs.docker.com/docker-for-windows/install/) to install Docker Desktop, which comes with Docker and Docker Compose. A free copy of Windows 10 Education is available from UVA.
    - If you're using Windows 10 Home (Version 1903, Build 18362 or above), which is what comes with most laptops, then follow [these instructions](https://docs.docker.com/docker-for-windows/install-windows-home/). The setup is a bit more complicated because you'll first need to setup [WSL 2](https://docs.microsoft.com/en-us/windows/wsl/install-win10#manual-installation-steps). WSL, or Windows Subsystem for Linux, is like a Linux virtual machine that runs in the command line (meaning there's no GUI). It allows Docker to run by using Linux behind the scenes. Check out the [VS Code instructions](https://code.visualstudio.com/docs/remote/wsl) to learn how to develop with WSL (optional).
3. Proceed at step 2 in **MacOS and Linux setup**

### Alternative Setup (Windows and MacOS if above failed)
0. [Install Vagrant](https://www.vagrantup.com/intro/getting-started/install.html)
1. `git clone https://github.com/thecourseforum/theCourseForum2.git`
2. Go into the `theCourseForum2/` folder and then run `vagrant up` to start a VM.
3. After that's booted, run `vagrant ssh` to run commands inside the VM.
4. `cd /vagrant`
5. Start at step 3 in **MacOS and Linux setup**. You may have to prefix all docker commands with `sudo` (e.g. `sudo docker-compose up`).
6. Go to http://127.0.0.1:8000 and make sure it works!
7. Run `vagrant` suspend when you're done to suspend the VM.


## Common Issues and Fixes

### Database Issues
If the 'Browse Courses' page isn't loading, try the following:
1. Check to see if postgres is running
    ```
    docker-compose exec web bash            # Exec into db container
    ps auxwww | grep postgres               # Check postgres processes
    ```
    If it outputs only one line, postgres is not running. 
    - MacOS: Restart it with Homebrew: `brew services start postgresql`
    - Linux: `sudo service postgresql restart`
2. There may be a Django migration issue. See the section below this for details.
3. If all else fails, reset the development database by dropping the table and re-running the Setup instructions.
    First run `sudo docker exec -i tcf_db psql -U tcf_django tcf_db` which will put you into the Postgres terminal (no message will be given)
    ```
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = 'tcf_db'
    AND pid <> pg_backend_pid();
    ```
    Exit the terminal with Ctrl-C or Ctrl-D
    Then run the following commands to drop and recreate the database
    ```
    sudo docker exec -i tcf_db dropdb -U tcf_django tcf_db
    sudo docker exec -i tcf_db createdb -U tcf_django tcf_db
    ```

### Django Migration Conflicts
After we removed the migrations folder from the `.gitignore` file, you may experience migration issues when you merge different branches where the models (database tables/columns) have been modified. Try the following to resolve the issue:

#### Local Development:
1. Delete everything in tcf_website/migrations EXCEPT for `__init__.py`.
    - If you accidentally delete this file, recreate an empty file with the same name. Migrations will not update without this file.
2. Delete everything in your `__pycache__` directories
3. While your container for the Django application is running, re-run migrations commands below:
```
docker-compose exec web bash
python3 manage.py makemigrations
python3 manage.py migrate
```
4. If all else fails, reset the development database by dropping the table and re-running the Database Setup instructions.

    First run `sudo docker exec -i tcf_db psql -U tcf_django tcf_db` which will put you into the Postgres terminal (no message will be given)
    ```
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = 'tcf_db'
    AND pid <> pg_backend_pid();
    ```
    Exit the terminal with Ctrl-C or Ctrl-D
    Then run the following commands to drop and recreate the database
    ```
    sudo docker exec -i tcf_db dropdb -U tcf_django tcf_db
    sudo docker exec -i tcf_db createdb -U tcf_django tcf_db
    ```

## Site Update Guides

### Data migration plan from tCF 1.0 (total downtime: 2.5 hours)
1. Get latest copy of legacy db using `mysqldump` from DO instance.
2. Convert to sqlite using `legacy_db/mysql2sqlite`
    - Then put in `settings.py` as database `legacy`
3. `docker exec -it tcf_django bash` and then `python manage.py migrate_legacy_subdepartments`
4. `python manage.py load_semester ALL_DANGEROUS`
5. `python manage.py load_grades ALL_DANGEROUS`
6. `python manage.py migrate_legacy_reviews`
7. `docker exec tcf_db pg_dump -U tcf_django -Fc tcf_db > dump.pgsql`
8. Test
    - Maybe crawl tCF and check that all viewable reviews are on the new system.
9. Upload to DigitalOcean DB.
    - `PGPASSWORD=$DB_PASS pg_restore -U $DB_USER -h $DB_HOST -p 25060 -d $DB_NAME < dump.pgsql`
    - You may have to run this command 3 times.

### New semester update plan
1. Go into the `/tcf_website/management/commands/semester_data` directory. Edit `fetch_data.py` to run `download_semester()` on the semester(s) you want*. For example, if you wanted Fall 2020, you would add a line saying `download_semester(2020, 'fall')`.
2. Commit this updated data and push it into the repo; it needs to be on prod to update the DB (you could update locally, but what's the point?). 
3. On a prod environment (we've been using `heroku run bash --app thecourseforum-dev` because our prod/dev DBs are linked...but we probably won't have it be this way forever), run `python3 manage.py load_semester ${SEMESTER}`, where `${SEMESTER}` is the semester you're adding in the format `YEAR_SEASON` e.g. `2020_FALL`. 
4. You should be able to run this command as many times as you want, as it accounts for/skips over duplicates and will update sections with new instructors as necessary. Most courses will likely not change much, but this duplicate handling helps us deal with classes whose instructors change after we load the data the first time.
5. I think we have to run the `department_fixes` script too? But not sure about that one.
6. TODO: Consolidate this into one master script that we can run as a cron job on prod.

<sub>\* Yeah, this method really sucks; should probably improve it in the consolidation process</sub>

### Deploying to prod
Production deployments (i.e. the version of the site users see on thecourseforum.com) should be handled automatically by our CI (continuous integration system). As of the writing of this documentation, Travis is set up to autodeploy every time a build on the `master` branch passes and we're working on moving towards GitHub Actions. However, in the event that something fails, the manual deploy process is outlined [here](https://docs.google.com/document/d/1sPl1v4JrvicrgQluXvG9cR6GWPijC0hr7zAa3h3uE5E/edit#heading=h.9mo53b4db0s8). Just note that the environmental variables list in the doc may not be up-to-date, so remember to set them accordingly.