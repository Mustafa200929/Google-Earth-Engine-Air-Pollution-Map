var so2VisParam = {"opacity":1,"bands":["SO2_column_number_density"],"min":-0.00003069383409478865,"max":0.00022709615900181934,"palette":["000000","0000ff","00ffff","ffff00","ff0000"]},
    sg_adm = ee.FeatureCollection("projects/ee-moizhk1/assets/sg_shapefile"), //replace with your own shapefile
    no2VisParam = {"opacity":1,"bands":["tropospheric_NO2_column_number_density"],"min":0.000029740831411217555,"max":0.00016362086522443833,"palette":["000000","0000ff","00ffff","ffff00","ff0000"]},
    coVisParam = {"opacity":1,"bands":["CO_column_number_density"],"min":0.026,"max":0.03564852119983639,"palette":["000000","0000ff","00ffff","ffff00","ff0000"]};
