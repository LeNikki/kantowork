/**
 * One shared vocabulary. A worker's skills and a job's requirements both point
 * here, which is what lets "jobs matching my skills" be a join rather than
 * string matching over free text.
 *
 * Seeded with a starting set. These are reference data, not user data, so they
 * belong in the migration - every machine gets the same ids.
 */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE TABLE kantowork.skills (
        id       INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name     VARCHAR(60) NOT NULL UNIQUE,
        category VARCHAR(40) NOT NULL
    );

    INSERT INTO kantowork.skills (name, category) VALUES
        ('Carpentry',        'Woodwork'),
        ('Cabinet making',   'Woodwork'),
        ('Furniture making', 'Woodwork'),
        ('Wood finishing',   'Woodwork'),
        ('Masonry',          'Building'),
        ('Concreting',       'Building'),
        ('Steelwork',        'Building'),
        ('Welding',          'Building'),
        ('Roofing',          'Building'),
        ('Plumbing',         'Installation'),
        ('Electrical',       'Installation'),
        ('Aircon and HVAC',  'Installation'),
        ('Appliance fitting','Installation'),
        ('Tiling',           'Finishing'),
        ('Painting',         'Finishing'),
        ('Plastering',       'Finishing'),
        ('Glass and glazing','Finishing'),
        ('Upholstery',       'Finishing'),
        ('General repairs',  'Maintenance'),
        ('Landscaping',      'Maintenance');
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TABLE IF EXISTS kantowork.skills;');
};
