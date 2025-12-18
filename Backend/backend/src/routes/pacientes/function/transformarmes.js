function procesarDatosMensuales(laboratorios) {
    // Mapeo de meses en inglés a español
    const mesesEnEspanol = {
        'January': 'Enero', 'February': 'Febrero', 'March': 'Marzo',
        'April': 'Abril', 'May': 'Mayo', 'June': 'Junio',
        'July': 'Julio', 'August': 'Agosto', 'September': 'Septiembre',
        'October': 'Octubre', 'November': 'Noviembre', 'December': 'Diciembre'
    };

    // Obtener todos los meses únicos
    const todosLosMeses = new Set();
    
    Object.values(laboratorios.data).forEach(lab => {
        lab.datos_historicos?.forEach(dato => {
            todosLosMeses.add(dato.month);
        });
    });
    
    // Convertir a array y ordenar cronológicamente
    const mesesUnicos = Array.from(todosLosMeses).sort((a, b) => {
        return new Date(a) - new Date(b);
    });
    
    // Tomar los últimos 3 meses
    const mesesRecientes = mesesUnicos.slice(-3);
    
    // Crear estructura de datos
    const datosMensuales = {};
    
    mesesRecientes.forEach(mes => {
        // Convertir formato YYYY-MM a nombre de mes en español
        const [year, month] = mes.split('-');
        const date = new Date(year, month - 1);
        const nombreMesIngles = date.toLocaleString('en', { month: 'long' });
        const nombreMesEspanol = mesesEnEspanol[nombreMesIngles];
        
        datosMensuales[mes] = {
            nombre: nombreMesEspanol,
            hemoglobina: laboratorios.data.hemoglobina.datos_historicos.find(d => d.month === mes)?.value || 0,
            hematocrito: laboratorios.data.hematocrito.datos_historicos.find(d => d.month === mes)?.value || 0,
            glicemia: laboratorios.data.glicemia.datos_historicos.find(d => d.month === mes)?.value || 0,
            urea: laboratorios.data.urea.datos_historicos.find(d => d.month === mes)?.value || 0,
            creatinina: laboratorios.data.creatinina.datos_historicos.find(d => d.month === mes)?.value || 0,
            albumina: laboratorios.data.albumina.datos_historicos.find(d => d.month === mes)?.value || 0,
            calcio: laboratorios.data.calcio.datos_historicos.find(d => d.month === mes)?.value || 0,
            fosforo: laboratorios.data.fosforo.datos_historicos.find(d => d.month === mes)?.value || 0
        };
    });
    
    return datosMensuales;
}