-- B2BMax Seed Data
-- Sample zones, sectors, market signals, and companies for testing

-- Insert zones (French geographic data)
INSERT INTO zones (code, name, type, parent_code, parent_type, population, area, density) VALUES
  ('11', 'Île-de-France', 'region', NULL, NULL, 12292895, 12011.5, 1023.4),
  ('84', 'Auvergne-Rhône-Alpes', 'region', NULL, NULL, 8121000, 69711, 116.5),
  ('75', 'Paris', 'department', '11', 'region', 2165423, 105.4, 20525),
  ('69', 'Rhône', 'department', '84', 'region', 1880000, 3249, 579),
  ('13', 'Bouches-du-Rhône', 'department', NULL, NULL, 2048000, 5087, 403),
  ('33', 'Gironde', 'department', NULL, NULL, 1623000, 9976, 163),
  ('59', 'Nord', 'department', NULL, NULL, 2611000, 5743, 455),
  ('31', 'Haute-Garonne', 'department', NULL, NULL, 1400000, 6309, 222),
  ('44', 'Loire-Atlantique', 'department', NULL, NULL, 1430000, 6775, 211),
  ('06', 'Alpes-Maritimes', 'department', NULL, NULL, 1100000, 4299, 256),
  ('67', 'Bas-Rhin', 'department', NULL, NULL, 1130000, 4755, 238),
  ('34', 'Hérault', 'department', NULL, NULL, 1180000, 6101, 194),
  ('35', 'Ille-et-Vilaine', 'department', NULL, NULL, 1070000, 6775, 158),
  ('69123', 'Lyon', 'commune', '69', 'department', 522000, 47.87, 10900)
ON CONFLICT (code) DO NOTHING;

-- Insert sectors (NAF codes)
INSERT INTO sectors (code, name, level, parent_code, parent_level, description) VALUES
  ('41', 'Construction', 'naf2', NULL, NULL, 'Construction of buildings and civil engineering'),
  ('47', 'Commerce de détail', 'naf2', NULL, NULL, 'Retail trade, except of motor vehicles'),
  ('49', 'Transports', 'naf2', NULL, NULL, 'Land, water, and air transport'),
  ('55', 'Hébergement', 'naf2', NULL, NULL, 'Accommodation services'),
  ('56', 'Restauration', 'naf2', NULL, NULL, 'Food and beverage service activities'),
  ('62', 'Programmation, conseil', 'naf2', NULL, NULL, 'Computer programming, consultancy and related activities'),
  ('68', 'Immobilier', 'naf2', NULL, NULL, 'Real estate activities'),
  ('86', 'Santé', 'naf2', NULL, NULL, 'Human health activities'),
  ('5610A', 'Restaurants traditionnels', 'naf5', '561', 'naf3', 'Traditional restaurants and food services'),
  ('5610B', 'Restauration rapide', 'naf5', '561', 'naf3', 'Fast food restaurants'),
  ('5630Z', 'Bars', 'naf5', '563', 'naf3', 'Drinking places'),
  ('6201Z', 'Programmation informatique', 'naf5', '620', 'naf3', 'Computer programming activities'),
  ('4711B', 'Supermarchés', 'naf5', '471', 'naf3', 'Supermarkets and hypermarkets'),
  ('4120A', 'Construction de maisons', 'naf5', '412', 'naf3', 'Construction of residential buildings')
ON CONFLICT (code) DO NOTHING;

-- Insert market signals (aggregated data)
INSERT INTO market_signals (
  zone_type, zone_code, zone_name, naf_level, naf_code, naf_name,
  time_period, start_date, end_date,
  total_companies, new_companies, closed_companies, net_growth,
  growth_rate, creation_rate, potential_score, potential_grade,
  competition_score, zone_population, zone_area
) VALUES
  -- Paris - Restauration
  ('department', '75', 'Paris', 'naf2', '56', 'Restauration', '2024-Q3', '2024-07-01', '2024-09-30', 2458, 213, 45, 168, 12.5, 8.65, 87.0, 'A', 35, 2165423, 105.4),
  ('department', '75', 'Paris', 'naf2', '56', 'Restauration', '2024-Q2', '2024-04-01', '2024-06-30', 2290, 198, 52, 146, 11.2, 8.12, 84.5, 'A', 38, 2165423, 105.4),
  ('department', '75', 'Paris', 'naf2', '56', 'Restauration', '2024-Q1', '2024-01-01', '2024-03-31', 2092, 175, 48, 127, 9.8, 7.45, 81.2, 'A', 40, 2165423, 105.4),
  ('department', '75', 'Paris', 'naf2', '56', 'Restauration', '2023-Q4', '2023-10-01', '2023-12-31', 1965, 162, 41, 121, 8.9, 6.98, 78.8, 'B', 42, 2165423, 105.4),

  -- Paris - Software/Tech
  ('department', '75', 'Paris', 'naf2', '62', 'Programmation, conseil', '2024-Q3', '2024-07-01', '2024-09-30', 1562, 254, 23, 231, 18.7, 14.2, 94.0, 'A', 55, 2165423, 105.4),
  ('department', '75', 'Paris', 'naf2', '62', 'Programmation, conseil', '2024-Q2', '2024-04-01', '2024-06-30', 1331, 198, 31, 167, 16.2, 12.8, 91.5, 'A', 58, 2165423, 105.4),
  ('department', '75', 'Paris', 'naf2', '62', 'Programmation, conseil', '2024-Q1', '2024-01-01', '2024-03-31', 1164, 175, 28, 147, 14.5, 11.5, 89.2, 'A', 60, 2165423, 105.4),

  -- Paris - Retail
  ('department', '75', 'Paris', 'naf2', '47', 'Commerce de détail', '2024-Q3', '2024-07-01', '2024-09-30', 3847, 158, 89, 69, 6.2, 5.8, 72.0, 'B', 65, 2165423, 105.4),
  ('department', '75', 'Paris', 'naf2', '47', 'Commerce de détail', '2024-Q2', '2024-04-01', '2024-06-30', 3778, 142, 95, 47, 5.1, 5.2, 69.5, 'B', 68, 2165423, 105.4),

  -- Lyon - Restauration
  ('commune', '69123', 'Lyon', 'naf2', '56', 'Restauration', '2024-Q3', '2024-07-01', '2024-09-30', 1234, 98, 32, 66, 9.4, 7.1, 78.0, 'B', 45, 522000, 47.87),
  ('commune', '69123', 'Lyon', 'naf2', '56', 'Restauration', '2024-Q2', '2024-04-01', '2024-06-30', 1168, 85, 28, 57, 8.2, 6.5, 75.5, 'B', 48, 522000, 47.87),

  -- Lyon - Software/Tech
  ('commune', '69123', 'Lyon', 'naf2', '62', 'Programmation, conseil', '2024-Q3', '2024-07-01', '2024-09-30', 892, 156, 18, 138, 21.3, 15.8, 92.0, 'A', 50, 522000, 47.87),
  ('commune', '69123', 'Lyon', 'naf2', '62', 'Programmation, conseil', '2024-Q2', '2024-04-01', '2024-06-30', 754, 128, 22, 106, 18.9, 14.2, 89.5, 'A', 52, 522000, 47.87),

  -- Lyon - Retail
  ('commune', '69123', 'Lyon', 'naf2', '47', 'Commerce de détail', '2024-Q3', '2024-07-01', '2024-09-30', 2156, 89, 54, 35, 4.8, 4.5, 65.0, 'B', 70, 522000, 47.87),

  -- Marseille - Restauration
  ('department', '13', 'Bouches-du-Rhône', 'naf2', '56', 'Restauration', '2024-Q3', '2024-07-01', '2024-09-30', 1876, 142, 38, 104, 8.7, 6.8, 76.5, 'B', 48, 2048000, 5087),

  -- Marseille - Software
  ('department', '13', 'Bouches-du-Rhône', 'naf2', '62', 'Programmation, conseil', '2024-Q3', '2024-07-01', '2024-09-30', 678, 98, 15, 83, 16.5, 12.8, 85.0, 'A', 58, 2048000, 5087),

  -- Bordeaux - Construction
  ('department', '33', 'Gironde', 'naf2', '41', 'Construction', '2024-Q3', '2024-07-01', '2024-09-30', 2345, 187, 62, 125, 10.8, 7.2, 74.0, 'B', 52, 1623000, 9976),

  -- Lille - Retail
  ('department', '59', 'Nord', 'naf2', '47', 'Commerce de détail', '2024-Q3', '2024-07-01', '2024-09-30', 3120, 134, 78, 56, 5.5, 5.1, 63.0, 'C', 72, 2611000, 5743),

  -- Toulouse - Software
  ('department', '31', 'Haute-Garonne', 'naf2', '62', 'Programmation, conseil', '2024-Q3', '2024-07-01', '2024-09-30', 1456, 198, 22, 176, 19.5, 14.8, 93.0, 'A', 48, 1400000, 6309),

  -- Nantes - Restauration
  ('department', '44', 'Loire-Atlantique', 'naf2', '56', 'Restauration', '2024-Q3', '2024-07-01', '2024-09-30', 987, 76, 24, 52, 7.8, 6.2, 71.0, 'B', 50, 1430000, 6775),

  -- Nice - Hébergement
  ('department', '06', 'Alpes-Maritimes', 'naf2', '55', 'Hébergement', '2024-Q3', '2024-07-01', '2024-09-30', 1234, 89, 34, 55, 8.2, 6.5, 73.5, 'B', 55, 1100000, 4299),

  -- Strasbourg - Software
  ('department', '67', 'Bas-Rhin', 'naf2', '62', 'Programmation, conseil', '2024-Q3', '2024-07-01', '2024-09-30', 567, 78, 12, 66, 15.2, 11.8, 82.0, 'A', 60, 1130000, 4755),

  -- Montpellier - Software
  ('department', '34', 'Hérault', 'naf2', '62', 'Programmation, conseil', '2024-Q3', '2024-07-01', '2024-09-30', 445, 68, 9, 59, 17.8, 13.2, 88.0, 'A', 55, 1180000, 6101),

  -- Rennes - Restauration
  ('department', '35', 'Ille-et-Vilaine', 'naf2', '56', 'Restauration', '2024-Q3', '2024-07-01', '2024-09-30', 756, 58, 19, 39, 7.2, 5.8, 68.0, 'B', 52, 1070000, 6775),

  -- France overall - Retail (using region level for country-wide)
  ('region', 'FR', 'France', 'naf2', '47', 'Commerce de détail', '2024-Q3', '2024-07-01', '2024-09-30', 45678, 1234, 892, 342, 5.2, 4.8, 62.0, 'C', 75, 68000000, 643801),

  -- France overall - Software
  ('region', 'FR', 'France', 'naf2', '62', 'Programmation, conseil', '2024-Q3', '2024-07-01', '2024-09-30', 23456, 3456, 456, 3000, 16.8, 13.5, 88.0, 'A', 58, 68000000, 643801),

  -- France overall - Restauration
  ('region', 'FR', 'France', 'naf2', '56', 'Restauration', '2024-Q3', '2024-07-01', '2024-09-30', 89234, 4567, 1234, 3333, 8.9, 6.8, 74.0, 'B', 52, 68000000, 643801)
ON CONFLICT DO NOTHING;

-- Insert sample companies
INSERT INTO companies (
  siren, siret, name, naf_code, naf_level2, naf_level3, naf_level4, naf_level5,
  naf_name, legal_form, address, postal_code, commune_code, commune_name,
  department_code, region_code, latitude, longitude,
  creation_date, employees_range, turnover_range, source
) VALUES
  -- Paris restaurants
  ('123456789', '12345678900011', 'Le Petit Bistrot Parisien', '5610A', '56', '561', '5610', '5610A', 'Restaurants traditionnels', 'SARL', '12 Rue de la Paix', '75002', '75102', 'Paris', '75', '11', 48.8686, 2.3312, '2024-08-15', '10-19', '1M-2M', 'insee'),
  ('234567890', '23456789000012', 'Chez Marie', '5610A', '56', '561', '5610', '5610A', 'Restaurants traditionnels', 'SAS', '45 Avenue des Champs-Élysées', '75008', '75108', 'Paris', '75', '11', 48.8738, 2.2950, '2024-07-22', '20-49', '2M-5M', 'insee'),
  ('345678901', '34567890100013', 'Fast Burger Paris', '5610B', '56', '561', '5610', '5610B', 'Restauration rapide', 'SAS', '78 Boulevard Saint-Germain', '75005', '75105', 'Paris', '75', '11', 48.8534, 2.3488, '2024-09-03', '50-99', '5M-10M', 'insee'),
  ('456789012', '45678901200014', 'Le Bar du Coin', '5630Z', '56', '563', '5630', '5630Z', 'Bars', 'SARL', '5 Rue de la République', '75011', '75111', 'Paris', '75', '11', 48.8566, 2.3722, '2024-06-18', '5-9', '500K-1M', 'insee'),
  ('567890123', '56789012300015', 'La Trattoria', '5610A', '56', '561', '5610', '5610A', 'Restaurants traditionnels', 'EI', '23 Rue Montorgueil', '75001', '75101', 'Paris', '75', '11', 48.8656, 2.3432, '2024-08-30', '1-2', '200K-500K', 'insee'),

  -- Paris software companies
  ('678901234', '67890123400016', 'TechVision SAS', '6201Z', '62', '620', '6201', '6201Z', 'Programmation informatique', 'SAS', '10 Rue de la Tech', '75010', '75110', 'Paris', '75', '11', 48.8766, 2.3622, '2024-07-10', '50-99', '5M-10M', 'insee'),
  ('789012345', '78901234500017', 'DataFlow Solutions', '6201Z', '62', '620', '6201', '6201Z', 'Programmation informatique', 'SAS', '25 Avenue de l''Innovation', '75013', '75113', 'Paris', '75', '11', 48.8356, 2.3654, '2024-08-05', '20-49', '2M-5M', 'insee'),
  ('890123456', '89012345600018', 'CloudNine Consulting', '6202Z', '62', '620', '6202', '6202Z', 'Conseil en systèmes et logiciels informatiques', 'SAS', '8 Boulevard Haussmann', '75009', '75109', 'Paris', '75', '11', 48.8756, 2.3376, '2024-09-12', '10-19', '1M-2M', 'insee'),
  ('901234567', '90123456700019', 'AI Dynamics', '6201Z', '62', '620', '6201', '6201Z', 'Programmation informatique', 'SAS', '42 Rue du Faubourg Saint-Antoine', '75012', '75112', 'Paris', '75', '11', 48.8534, 2.3856, '2024-06-25', '100-199', '10M-20M', 'insee'),
  ('012345678', '01234567800020', 'WebCraft Studio', '6201Z', '62', '620', '6201', '6201Z', 'Programmation informatique', 'SARL', '15 Rue de Rivoli', '75004', '75104', 'Paris', '75', '11', 48.8556, 2.3556, '2024-08-20', '5-9', '500K-1M', 'insee'),

  -- Paris retail
  ('111222333', '11122233300021', 'Fashion Boutique Paris', '4711B', '47', '471', '4711', '4711B', 'Supermarchés', 'SARL', '33 Rue du Commerce', '75015', '75115', 'Paris', '75', '11', 48.8456, 2.2956, '2024-07-15', '10-19', '1M-2M', 'insee'),
  ('222333444', '22233344400022', 'Tech Store Paris', '4761Z', '47', '476', '4761', '4761Z', 'Commerce de détail de biens informatiques', 'SAS', '55 Avenue de la République', '75011', '75111', 'Paris', '75', '11', 48.8656, 2.3722, '2024-09-01', '20-49', '2M-5M', 'insee'),

  -- Lyon restaurants
  ('333444555', '33344455500023', 'Bouchon Lyonnais', '5610A', '56', '561', '5610', '5610A', 'Restaurants traditionnels', 'SARL', '12 Rue des Marronniers', '69002', '69382', 'Lyon', '69', '84', 45.7578, 4.8320, '2024-08-10', '20-49', '2M-5M', 'insee'),
  ('444555666', '44455566600024', 'Lyon Food Market', '5610B', '56', '561', '5610', '5610B', 'Restauration rapide', 'SAS', '8 Place Bellecour', '69002', '69382', 'Lyon', '69', '84', 45.7579, 4.8320, '2024-07-28', '50-99', '5M-10M', 'insee'),

  -- Lyon software
  ('555666777', '55566677700025', 'Lyon Tech Hub', '6201Z', '62', '620', '6201', '6201Z', 'Programmation informatique', 'SAS', '25 Rue de la République', '69001', '69381', 'Lyon', '69', '84', 45.7640, 4.8357, '2024-06-15', '100-199', '10M-20M', 'insee'),
  ('666777888', '66677788800026', 'Silicon Rhône', '6202Z', '62', '620', '6202', '6202Z', 'Conseil en systèmes et logiciels informatiques', 'SAS', '10 Avenue Jean Jaurès', '69007', '69387', 'Lyon', '69', '84', 45.7456, 4.8456, '2024-08-22', '20-49', '2M-5M', 'insee'),
  ('777888999', '77788899900027', 'DataLyon', '6201Z', '62', '620', '6201', '6201Z', 'Programmation informatique', 'SAS', '5 Quai Saint-Vincent', '69001', '69381', 'Lyon', '69', '84', 45.7689, 4.8278, '2024-09-05', '10-19', '1M-2M', 'insee'),

  -- Marseille
  ('888999000', '88899900000028', 'Marseille Software', '6201Z', '62', '620', '6201', '6201Z', 'Programmation informatique', 'SAS', '15 La Canebière', '13001', '13201', 'Marseille', '13', '93', 43.2965, 5.3698, '2024-07-18', '20-49', '2M-5M', 'insee'),
  ('999000111', '99900011100029', 'Le Vieux Port Resto', '5610A', '56', '561', '5610', '5610A', 'Restaurants traditionnels', 'SARL', '22 Quai du Port', '13002', '13202', 'Marseille', '13', '93', 43.2851, 5.3698, '2024-08-25', '10-19', '1M-2M', 'insee'),

  -- Bordeaux
  ('100200300', '10020030000030', 'Bordeaux Construction', '4120A', '41', '412', '4120', '4120A', 'Construction de maisons', 'SAS', '45 Cours de l''Intendance', '33000', '33063', 'Bordeaux', '33', '75', 44.8378, -0.5792, '2024-07-05', '50-99', '5M-10M', 'insee'),

  -- Toulouse
  ('200300400', '20030040000031', 'Toulouse Aerospace Tech', '6201Z', '62', '620', '6201', '6201Z', 'Programmation informatique', 'SAS', '12 Rue du Taur', '31000', '31555', 'Toulouse', '31', '76', 43.6045, 1.4442, '2024-06-20', '100-199', '10M-20M', 'insee'),
  ('300400500', '30040050000032', 'Toulouse Data Systems', '6202Z', '62', '620', '6202', '6202Z', 'Conseil en systèmes et logiciels informatiques', 'SAS', '8 Allée Jean Jaurès', '31000', '31555', 'Toulouse', '31', '76', 43.6045, 1.4442, '2024-08-14', '20-49', '2M-5M', 'insee'),

  -- Lille
  ('400500600', '40050060000033', 'Lille Retail Group', '4711B', '47', '471', '4711', '4711B', 'Supermarchés', 'SAS', '25 Rue Nationale', '59000', '59350', 'Lille', '59', '32', 50.6292, 3.0573, '2024-09-08', '50-99', '5M-10M', 'insee'),

  -- Nantes
  ('500600700', '50060070000034', 'Nantes Food Co', '5610A', '56', '561', '5610', '5610A', 'Restaurants traditionnels', 'SARL', '15 Rue Crébillon', '44000', '44109', 'Nantes', '44', '52', 47.2184, -1.5536, '2024-08-01', '10-19', '1M-2M', 'insee'),

  -- Nice
  ('600700800', '60070080000035', 'Côte d''Azur Hôtels', '5510Z', '55', '551', '5510', '5510Z', 'Hôtels et hébergement similaire', 'SAS', '7 Promenade des Anglais', '06000', '06088', 'Nice', '06', '93', 43.6951, 7.2656, '2024-07-12', '50-99', '5M-10M', 'insee'),

  -- Strasbourg
  ('700800900', '70080090000036', 'Strasbourg Digital', '6201Z', '62', '620', '6201', '6201Z', 'Programmation informatique', 'SAS', '3 Place Kléber', '67000', '67482', 'Strasbourg', '67', '44', 48.5734, 7.7521, '2024-08-18', '20-49', '2M-5M', 'insee'),

  -- Montpellier
  ('800900100', '80090010000037', 'Montpellier Tech', '6201Z', '62', '620', '6201', '6201Z', 'Programmation informatique', 'SAS', '5 Rue de la Loge', '34000', '34172', 'Montpellier', '34', '76', 43.6108, 3.8767, '2024-07-25', '10-19', '1M-2M', 'insee'),

  -- Rennes
  ('900100200', '90010020000038', 'Rennes Gastronomie', '5610A', '56', '561', '5610', '5610A', 'Restaurants traditionnels', 'SARL', '10 Rue du Chapitre', '35000', '35238', 'Rennes', '35', '53', 48.1173, -1.6778, '2024-09-10', '5-9', '500K-1M', 'insee')
ON CONFLICT (siren) DO NOTHING;
