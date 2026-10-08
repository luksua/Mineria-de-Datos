# Benchmark Comparativo de Modelos: Árbol CART vs Red Neuronal MLP vs Regresión Logística
suppressPackageStartupMessages({ library(rpart); library(nnet) })
set.seed(42)
df <- read.csv('c:/xampp/htdocs/api vehiculos tutoria/MINERIA_DATOS/UNIDAD_4/01_SELECCION_BASE_DATOS/datos/higher_education_dropout_dataset.csv')
idx <- sample(1:nrow(df), 0.7 * nrow(df))
train <- df[idx, -1]; test <- df[-idx, -1]
# 1. Regresión Logística (GLM)
m_glm <- glm(Abandono_Estudiantil ~ ., data = train, family = binomial)
p_glm <- predict(m_glm, test, type = 'response')
pred_glm <- ifelse(p_glm > 0.5, 1, 0)
acc_glm <- mean(pred_glm == test$Abandono_Estudiantil) * 100
# 2. Árbol de Decisión CART
m_tree <- rpart(Abandono_Estudiantil ~ ., data = train, method = 'class', cp = 0.02)
pred_tree <- as.numeric(as.character(predict(m_tree, test, type = 'class')))
acc_tree <- mean(pred_tree == test$Abandono_Estudiantil) * 100
# 3. Red Neuronal Artificial (nnet)
m_nn <- nnet(Abandono_Estudiantil ~ ., data = train, size = 4, decay = 0.05, maxit = 300, trace = FALSE)
p_nn <- predict(m_nn, test, type = 'raw')
pred_nn <- ifelse(p_nn > 0.5, 1, 0)
acc_nn <- mean(pred_nn == test$Abandono_Estudiantil) * 100
# Comparativa
ranking <- data.frame(Modelo = c('Regresión Logística', 'Árbol CART', 'Red Neuronal (MLP)'), Exactitud_Test = c(acc_glm, acc_tree, acc_nn))
ranking <- ranking[order(-ranking$Exactitud_Test), ]
dir_res <- 'c:/xampp/htdocs/api vehiculos tutoria/MINERIA_DATOS/UNIDAD_4/02_APLICACION_TECNICAS/resultados'
png(file.path(dir_res, 'grafico_02_benchmark_proyecto.png'), width = 800, height = 600, res = 120)
barplot(ranking$Exactitud_Test, names.arg = ranking$Modelo, col = c('forestgreen', 'cornflowerblue', 'salmon'), main = 'Comparativa de Exactitud (%) en Predicción de Abandono Estudiantil', ylab = 'Exactitud (%)', ylim = c(0, 100))
text(1:3 * 1.2 - 0.5, ranking$Exactitud_Test - 5, paste0(round(ranking$Exactitud_Test, 1), '%'), col = 'white', font = 2)
dev.off()
sink(file.path(dir_res, 'metricas_proyecto.txt'))
cat('BENCHMARK MULTIMODELO - PROYECTO INTEGRADOR:

')
print(ranking)
cat('
Modelo Campeón Seleccionado:', ranking$Modelo[1], 'con', round(ranking$Exactitud_Test[1], 2), '% de exactitud.
')
sink()
cat('Benchmark de proyecto completado exitosamente.
')
