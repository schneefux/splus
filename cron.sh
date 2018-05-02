#!/bin/bash

set -x
TMP=$(mktemp -d)
cd $TMP
git clone -b gh-pages git@github.com:schneefux/splus .
npm install
npm start
git commit -am "Cron $(date)"
git push
cd /
rm -rf $TMP
