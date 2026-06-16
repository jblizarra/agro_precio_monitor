# AgroPrecio Monitor

Aplicacion web estatica para comparar precios de supermercado con precios de productor en productos alimentarios.

## Uso

Abre `index.html` en el navegador. La aplicacion incluye datos de muestra, filtros por producto, categoria y supermercado, alertas por margen, exportacion CSV e importacion CSV.

## Formato CSV

La importacion espera las columnas en este orden:

```csv
product,categoria,supermercado,precio_productor,precio_lineal,variacion_semanal,provincia
Tomate pera,Hortalizas,Mercadona,0.72,2.29,4.6,Valencia
```

Los precios deben expresarse en euros por kilo o litro, usando punto decimal.

## Siguientes integraciones

- Conectores de scraping o API por cadena de supermercado.
- Fuentes de origen: lonjas, cooperativas, observatorios agrarios o carga manual.
- Persistencia historica para series temporales y alertas recurrentes.
