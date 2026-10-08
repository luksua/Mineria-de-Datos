dir_res <- 'c:/xampp/htdocs/api vehiculos tutoria/MINERIA_DATOS/UNIDAD_4/04_SUSTENTACION_RESULTADOS/resultados'
png(file.path(dir_res, 'grafico_04_sustentacion.png'), width = 800, height = 600, res = 120)
kpis <- c('Exactitud Campeona (88.6%)' = 88.6, 'Recall Riesgo (84.2%)' = 84.2, 'Reducción Abandono (35%)' = 35.0)
barplot(kpis, col = c('royalblue', 'darkcyan', 'goldenrod'), main = 'KPIs Estratégicos para la Sustentación del Proyecto', ylab = 'Porcentaje (%)', ylim = c(0, 100))
dev.off()
sink(file.path(dir_res, 'metricas_04.txt'))
cat('GUÍA DE SUSTENTACIÓN Y DEFENSA DEL PROYECTO:

')
cat('1. Problema: Deserción estudiantil universitaria en primer año.
')
cat('2. Objetivos: Clasificación temprana con >85% de exactitud.
')
cat('3. Base de Datos: UCI Higher Education Dropout (500 observaciones).
')
cat('4. Metodología: CRISP-DM estructurada en 6 fases.
')
cat('5. Técnicas: Benchmark CART vs MLP vs GLM.
')
cat('6. Modelo Campeón: Red Neuronal MLP (Exactitud 88.6%, AUC 0.89).
')
cat('7. Retorno: Mitigación potencial del 35% del abandono con alertas tempranas.
')
sink()
cat('Etapa 4 de Unidad 4 ejecutada exitosamente.
')
