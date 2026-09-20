# TurnoFlex · AutoBox

Prototipo web del caso **TurnoFlex** aplicado a **AutoBox**, la PyME de talleres multimarca del trabajo de IDS (Grupo 8).

## Cómo correrlo

```bash
cd C:\Users\Martin\source\turnoflex-autobox
npm install
npm run dev
```

Abrí `http://localhost:5173` e ingresá con un perfil demo (no hay contraseña).

## Qué cubre

- Portal de cliente: reserva en 5 pasos, motor de disponibilidad (mecánico + box), cancelación con regla de 24 h.
- Pack Flota 10: créditos, vigencia, vencimiento y solicitud de congelamiento.
- Recepción: check-in y no-show.
- Taller: inicio/cierre de trabajo y pedido de excepción (sin forzar sobreturno).
- Coordinación: aprueba congelamientos y excepciones con trazabilidad.
- Dashboard: no-show, uso de packs y recaudación (la venta del pack no se vuelve a contar al usar un crédito).
- Liquidación quincenal de mecánicos sobre servicios completados.

Los datos viven en `localStorage`. El botón **Reset demo** vuelve a la semilla.
