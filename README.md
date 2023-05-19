# The Quest


## Initial Setup

to setup the postgres database in a docker container, run:

```
yarn db:dev:up
```

to seed the database with data pulled from the given csv files, run:

```
yarn db:dev:seed
```

Please note that multiple seedings will fail because of unique contraints. However, if you ok clearing all the data from the databse before seeding, run `yarn db:dev:restart` before running `yarn db:dev:seed`

