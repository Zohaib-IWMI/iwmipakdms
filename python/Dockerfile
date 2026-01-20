FROM python:3.10

RUN apt-get update && apt-get install nodejs npm -y
WORKDIR /python
COPY package.json .
RUN npm install
RUN pip3 install shapely psycopg2 pandas matplotlib earthengine-api python-dotenv geopandas diskcache
COPY . .
CMD npm start

EXPOSE 8082
