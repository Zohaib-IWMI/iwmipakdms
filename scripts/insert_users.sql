USE pakdms;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'wajedpmd' AS f_name,
'' AS l_name,
'wajedpmd@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'wajedpmd@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'ilyaspmd86' AS f_name,
'' AS l_name,
'ilyaspmd86@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'ilyaspmd86@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'referaljudislot88' AS f_name,
'' AS l_name,
'referaljudislot88@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'referaljudislot88@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'khushbukhatphd2009' AS f_name,
'' AS l_name,
'khushbukhatphd2009@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'khushbukhatphd2009@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'a.mubashir' AS f_name,
'' AS l_name,
'a.mubashir@cgiar.org' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'a.mubashir@cgiar.org'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'bismasattar' AS f_name,
'' AS l_name,
'bismasattar@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'bismasattar@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'zubair71pk' AS f_name,
'' AS l_name,
'zubair71pk@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'zubair71pk@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'shafique_khaskheli' AS f_name,
'' AS l_name,
'shafique_khaskheli@pmd.gov.pk' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'shafique_khaskheli@pmd.gov.pk'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'z.shahid' AS f_name,
'' AS l_name,
'z.shahid@cgiar.org' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'z.shahid@cgiar.org'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'1mariarehman' AS f_name,
'' AS l_name,
'1mariarehman@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = '1mariarehman@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'aarishmaqsood' AS f_name,
'' AS l_name,
'aarishmaqsood@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'aarishmaqsood@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'jackabestwick' AS f_name,
'' AS l_name,
'jackabestwick@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'jackabestwick@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'cto' AS f_name,
'' AS l_name,
'cto@spatial.levantc.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'cto@spatial.levantc.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'rajambilal7' AS f_name,
'' AS l_name,
'rajambilal7@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'rajambilal7@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'pcrwr2005' AS f_name,
'' AS l_name,
'pcrwr2005@yahoo.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'pcrwr2005@yahoo.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'rmcrcdpc' AS f_name,
'' AS l_name,
'rmcrcdpc@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'rmcrcdpc@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'eve.apariciom' AS f_name,
'' AS l_name,
'eve.apariciom@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'eve.apariciom@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'tahirdd' AS f_name,
'' AS l_name,
'tahirdd@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'tahirdd@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'abbaskhan797940' AS f_name,
'' AS l_name,
'abbaskhan797940@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'abbaskhan797940@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'21b-039-cs' AS f_name,
'' AS l_name,
'21b-039-cs@students.uit.edu' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = '21b-039-cs@students.uit.edu'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'Safdarsani4340' AS f_name,
'' AS l_name,
'Safdarsani4340@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'Safdarsani4340@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'sherwan_asif' AS f_name,
'' AS l_name,
'sherwan_asif@hotmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'sherwan_asif@hotmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'nasiryaseen' AS f_name,
'' AS l_name,
'nasiryaseen@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'nasiryaseen@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
's.siddiqui' AS f_name,
'' AS l_name,
's.siddiqui@cgiar.org' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 's.siddiqui@cgiar.org'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'ma.rustam786' AS f_name,
'' AS l_name,
'ma.rustam786@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'ma.rustam786@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'dihazrafi' AS f_name,
'' AS l_name,
'dihazrafi@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'dihazrafi@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'sidratahira07860' AS f_name,
'' AS l_name,
'sidratahira07860@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'sidratahira07860@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'zia.tahseen' AS f_name,
'' AS l_name,
'zia.tahseen@farmovation.tech' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'zia.tahseen@farmovation.tech'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'rashidbilal68' AS f_name,
'' AS l_name,
'rashidbilal68@yahoo.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'rashidbilal68@yahoo.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'quratuetian29' AS f_name,
'' AS l_name,
'quratuetian29@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'quratuetian29@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'jack.bestwick' AS f_name,
'' AS l_name,
'jack.bestwick@startprogrammes.org' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'jack.bestwick@startprogrammes.org'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'azamjamal554' AS f_name,
'' AS l_name,
'azamjamal554@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'azamjamal554@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'nomanafzal1991' AS f_name,
'' AS l_name,
'nomanafzal1991@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'nomanafzal1991@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'azeemaalam94' AS f_name,
'' AS l_name,
'azeemaalam94@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'azeemaalam94@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'engr.umair831' AS f_name,
'' AS l_name,
'engr.umair831@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'engr.umair831@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'm_umairr' AS f_name,
'' AS l_name,
'm_umairr@yahoo.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'm_umairr@yahoo.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'saqibmmmit' AS f_name,
'' AS l_name,
'saqibmmmit@yahoo.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'saqibmmmit@yahoo.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'shaz.adnan' AS f_name,
'' AS l_name,
'shaz.adnan@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'shaz.adnan@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'naeemajnabi' AS f_name,
'' AS l_name,
'naeemajnabi@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'naeemajnabi@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'k.hussain' AS f_name,
'' AS l_name,
'k.hussain@cgiar.org' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'k.hussain@cgiar.org'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'attiabatool8445' AS f_name,
'' AS l_name,
'attiabatool8445@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'attiabatool8445@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'dr.ashraf' AS f_name,
'' AS l_name,
'dr.ashraf@kfueit.edu.pk' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'dr.ashraf@kfueit.edu.pk'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'StartNetworkPAKDMS' AS f_name,
'' AS l_name,
'StartNetworkPAKDMS@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'StartNetworkPAKDMS@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'mrmkhokhar' AS f_name,
'' AS l_name,
'mrmkhokhar@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'mrmkhokhar@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'anwarsadiq07860' AS f_name,
'' AS l_name,
'anwarsadiq07860@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'anwarsadiq07860@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'usman.ali.pmd' AS f_name,
'' AS l_name,
'usman.ali.pmd@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'usman.ali.pmd@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'moctar.dembele' AS f_name,
'' AS l_name,
'moctar.dembele@cgiar.org' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'moctar.dembele@cgiar.org'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'sadaqatagri' AS f_name,
'' AS l_name,
'sadaqatagri@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'sadaqatagri@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'aarish.maqsood' AS f_name,
'' AS l_name,
'aarish.maqsood@cgiar.org' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'aarish.maqsood@cgiar.org'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'isultanmz333' AS f_name,
'' AS l_name,
'isultanmz333@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'isultanmz333@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'laibanoorkhalid' AS f_name,
'' AS l_name,
'laibanoorkhalid@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'laibanoorkhalid@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'Akif.Rahim' AS f_name,
'' AS l_name,
'Akif.Rahim@cgiar.org' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'Akif.Rahim@cgiar.org'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'nadeemqta' AS f_name,
'' AS l_name,
'nadeemqta@yahoo.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'nadeemqta@yahoo.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'nuzba.gcisc' AS f_name,
'' AS l_name,
'nuzba.gcisc@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'nuzba.gcisc@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'shahid.iqbal' AS f_name,
'' AS l_name,
'shahid.iqbal@cgiar.org' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'shahid.iqbal@cgiar.org'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'msohaibnasirpak' AS f_name,
'' AS l_name,
'msohaibnasirpak@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'msohaibnasirpak@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'faisal.met' AS f_name,
'' AS l_name,
'faisal.met@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'faisal.met@gmail.com'
) LIMIT 1;
INSERT INTO users 
(f_name, l_name, username, password, admin, isApproved, admin1, admin1Name, admin2, admin2Name, organization, purpose)
SELECT * FROM (SELECT 
'azizpmd' AS f_name,
'' AS l_name,
'azizpmd@gmail.com' AS username,
'$2b$10$f1r3GxYxRblDg1qXP23jEuFJvlKhYlNE7OVL70FjRoKlW8J8/Z6L6' AS password,
0 AS admin,
1 AS isApproved,
0 AS admin1,
'' AS admin1Name,
0 AS admin2,
'' AS admin2Name,
'' AS organization,
'' AS purpose
) AS tmp
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE username = 'azizpmd@gmail.com'
) LIMIT 1;
