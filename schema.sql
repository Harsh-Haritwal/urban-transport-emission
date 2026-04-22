
-- Supported transport modes
CREATE TABLE transport_modes (
    id          SERIAL PRIMARY KEY,
    mode_key    VARCHAR(20) UNIQUE NOT NULL,   -- 'car', 'bus', 'metro', 'bike', 'cycle'
    label       VARCHAR(50) NOT NULL,
    icon        VARCHAR(10)
);

INSERT INTO transport_modes (mode_key, label, icon) VALUES
  ('car',   'Car',          '🚗'),
  ('bus',   'Bus',          '🚌'),
  ('metro', 'Metro',        '🚇'),
  ('bike',  'Two-Wheeler',  '🛵'),
  ('cycle', 'Bicycle',      '🚲');

-- Emission factors per mode + fuel (g CO2 per km)
CREATE TABLE emission_factors (
    id              SERIAL PRIMARY KEY,
    mode_id         INTEGER REFERENCES transport_modes(id),
    fuel_type       VARCHAR(20) NOT NULL,  -- 'petrol', 'diesel', 'cng', 'electric'
    grams_per_km    DECIMAL(8,2) NOT NULL,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO emission_factors (mode_id, fuel_type, grams_per_km) VALUES
  -- Car
  (1, 'petrol',   192.00),
  (1, 'diesel',   171.00),
  (1, 'cng',      120.00),
  (1, 'electric',  50.00),
  -- Bus
  (2, 'petrol',    82.00),
  (2, 'diesel',    68.00),
  (2, 'cng',       52.00),
  (2, 'electric',  18.00),
  -- Metro
  (3, 'electric',  14.00),
  -- Two-Wheeler / Bike
  (4, 'petrol',    88.00),
  (4, 'diesel',    72.00),
  (4, 'cng',       55.00),
  (4, 'electric',  22.00),
  -- Bicycle
  (5, 'none',       0.00);

-- City zones for heatmap
CREATE TABLE city_zones (
    id          SERIAL PRIMARY KEY,
    zone_key    VARCHAR(10) UNIQUE NOT NULL,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    lat         DECIMAL(10,7),
    lng         DECIMAL(10,7)
);

INSERT INTO city_zones (zone_key, name, description) VALUES
  ('A', 'Central Business District', 'High-density office and commercial area'),
  ('B', 'Industrial Area',           'Manufacturing and logistics hub'),
  ('C', 'Residential North',         'Low-density suburban residential'),
  ('D', 'Market/Commercial',         'Retail and street market zone'),
  ('E', 'Highway Corridor',          'Major arterial roads and flyovers'),
  ('F', 'Airport Zone',              'Airport and cargo terminal area'),
  ('G', 'Suburban South',            'Quiet residential outskirts');

-- Hourly emission readings per zone
CREATE TABLE zone_emission_readings (
    id              SERIAL PRIMARY KEY,
    zone_id         INTEGER REFERENCES city_zones(id),
    recorded_at     TIMESTAMP NOT NULL,
    hour_of_day     SMALLINT CHECK (hour_of_day BETWEEN 0 AND 23),
    emission_index  SMALLINT CHECK (emission_index BETWEEN 0 AND 100),  -- 0=clean, 100=peak
    vehicle_count   INTEGER,
    PRIMARY KEY (zone_id, recorded_at)
);

-- Individual trip records
CREATE TABLE trips (
    id              SERIAL PRIMARY KEY,
    session_id      UUID,
    mode_id         INTEGER REFERENCES transport_modes(id),
    fuel_type       VARCHAR(20),
    distance_km     DECIMAL(8,2) NOT NULL,
    passengers      SMALLINT DEFAULT 1,
    co2_grams       DECIMAL(10,2) NOT NULL,
    zone_id         INTEGER REFERENCES city_zones(id),
    recorded_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily aggregated stats per mode (for trend charts)
CREATE TABLE daily_mode_stats (
    id              SERIAL PRIMARY KEY,
    stat_date       DATE NOT NULL,
    mode_id         INTEGER REFERENCES transport_modes(id),
    total_trips     INTEGER DEFAULT 0,
    total_distance  DECIMAL(12,2) DEFAULT 0,
    total_co2_tons  DECIMAL(10,4) DEFAULT 0,
    UNIQUE (stat_date, mode_id)
);

--  Useful Views 

-- Today's total CO2 by mode
CREATE VIEW today_co2_by_mode AS
SELECT
    tm.label           AS mode,
    tm.icon,
    SUM(t.co2_grams) / 1e6 AS co2_tons
FROM trips t
JOIN transport_modes tm ON t.mode_id = tm.id
WHERE DATE(t.recorded_at) = CURRENT_DATE
GROUP BY tm.label, tm.icon
ORDER BY co2_tons DESC;

-- Peak emission hours today
CREATE VIEW peak_hours_today AS
SELECT
    hour_of_day,
    AVG(emission_index) AS avg_index,
    MAX(emission_index) AS peak_index
FROM zone_emission_readings
WHERE DATE(recorded_at) = CURRENT_DATE
GROUP BY hour_of_day
ORDER BY avg_index DESC;

-- Most polluted zones right now (last 30 mins)
CREATE VIEW current_hot_zones AS
SELECT
    cz.name         AS zone_name,
    zer.emission_index,
    zer.vehicle_count,
    zer.recorded_at
FROM zone_emission_readings zer
JOIN city_zones cz ON zer.zone_id = cz.id
WHERE zer.recorded_at >= NOW() - INTERVAL '30 minutes'
ORDER BY zer.emission_index DESC
LIMIT 5;

-- Weekly emission trend (last 7 days)
CREATE VIEW weekly_trend AS
SELECT
    stat_date,
    tm.label,
    total_co2_tons
FROM daily_mode_stats dms
JOIN transport_modes tm ON dms.mode_id = tm.id
WHERE stat_date >= CURRENT_DATE - INTERVAL '6 days'
ORDER BY stat_date, tm.label;

--  Indexes 
CREATE INDEX idx_trips_recorded    ON trips (recorded_at);
CREATE INDEX idx_trips_mode        ON trips (mode_id);
CREATE INDEX idx_readings_zone     ON zone_emission_readings (zone_id);
CREATE INDEX idx_readings_recorded ON zone_emission_readings (recorded_at);
CREATE INDEX idx_daily_date        ON daily_mode_stats (stat_date);
