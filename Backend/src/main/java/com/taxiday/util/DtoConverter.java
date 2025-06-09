package com.taxiday.util;

import com.taxiday.dto.TurnoDto;
import com.taxiday.dto.CarreraDto;
import com.taxiday.dto.TaxistaDto;
import com.taxiday.dto.JornadaDto;
import com.taxiday.model.Turno;
import com.taxiday.model.Carrera;
import com.taxiday.model.Taxista;
import com.taxiday.model.Jornada;
import java.util.stream.Collectors;

// Esta clase se encarga de convertir datos entre los objetos que usa la aplicación (como Turno, Carrera, Taxista y Jornada) 
// y los objetos que se envían o reciben al comunicarse con otras partes del sistema. Esto ayuda a organizar mejor la información 
// y a asegurarse de que solo se compartan los datos necesarios.


public class DtoConverter {
    
    // Métodos para Turno
    public static TurnoDto toTurnoDto(Turno turno) {
        if (turno == null) return null;
        TurnoDto turnoDto = new TurnoDto();
        turnoDto.setIdTurno(turno.getIdTurno());
        turnoDto.setKmInicial(turno.getKmInicial());
        turnoDto.setKmFinal(turno.getKmFinal());
        turnoDto.setFechaInicio(turno.getFechaInicio());
        turnoDto.setFechaFinal(turno.getFechaFinal());
        turnoDto.setEstado(turno.getEstado());
        turnoDto.setNotas(turno.getNotas());
        
        // Añadir carreras si existen
        if (turno.getCarreras() != null) {
            turnoDto.setCarreras(turno.getCarreras().stream()
                .map(DtoConverter::toCarreraDto)
                .collect(Collectors.toList()));
        }
        
        return turnoDto;
    }
    
    public static Turno toTurnoEntity(TurnoDto turnoDto) {
        if (turnoDto == null) return null;
        Turno turno = new Turno();
        turno.setIdTurno(turnoDto.getIdTurno());
        turno.setKmInicial(turnoDto.getKmInicial());
        turno.setKmFinal(turnoDto.getKmFinal());
        turno.setFechaInicio(turnoDto.getFechaInicio());
        turno.setFechaFinal(turnoDto.getFechaFinal());
        turno.setEstado(turnoDto.getEstado());
        turno.setNotas(turnoDto.getNotas());
        return turno;
    }
    
    // Métodos para Carrera
    public static CarreraDto toCarreraDto(Carrera carrera) {
        if (carrera == null) return null;
        CarreraDto carreraDto = new CarreraDto();
        carreraDto.setIdCarrera(carrera.getIdCarrera());
        carreraDto.setFechaInicio(carrera.getFechaInicio());
        carreraDto.setImporteTotal(carrera.getImporteTotal());
        carreraDto.setImporteTaximetro(carrera.getImporteTaximetro());
        carreraDto.setPropina(carrera.getPropina());
        carreraDto.setTipoPago(carrera.getTipoPago());
        carreraDto.setEsAeropuerto(carrera.getEsAeropuerto());
        carreraDto.setEsEmisora(carrera.getEsEmisora());
        carreraDto.setNotas(carrera.getNotas());
        return carreraDto;
    }
    
    public static Carrera toCarreraEntity(CarreraDto carreraDto) {
        if (carreraDto == null) return null;
        Carrera carrera = new Carrera();
        carrera.setIdCarrera(carreraDto.getIdCarrera());
        carrera.setImporteTotal(carreraDto.getImporteTotal());
        carrera.setImporteTaximetro(carreraDto.getImporteTaximetro());
        carrera.setPropina(carreraDto.getPropina());
        carrera.setTipoPago(carreraDto.getTipoPago());
        carrera.setEsAeropuerto(carreraDto.getEsAeropuerto());
        carrera.setEsEmisora(carreraDto.getEsEmisora());
        carrera.setNotas(carreraDto.getNotas());
        return carrera;
    }
    
    // Métodos para Taxista
    public static TaxistaDto toTaxistaDto(Taxista taxista) {
        if (taxista == null) return null;
        TaxistaDto taxistaDto = new TaxistaDto();
        taxistaDto.setIdTaxista(taxista.getIdTaxista());
        taxistaDto.setNombre(taxista.getNombre());
        taxistaDto.setApellidos(taxista.getApellidos());
        taxistaDto.setLicencia(taxista.getLicencia());
        taxistaDto.setEmail(taxista.getEmail());
        taxistaDto.setTelefono(taxista.getTelefono());
        return taxistaDto;
    }
    
    public static Taxista toTaxistaEntity(TaxistaDto taxistaDto) {
        if (taxistaDto == null) return null;
        Taxista taxista = new Taxista();
        taxista.setIdTaxista(taxistaDto.getIdTaxista());
        taxista.setNombre(taxistaDto.getNombre());
        taxista.setApellidos(taxistaDto.getApellidos());
        taxista.setLicencia(taxistaDto.getLicencia());
        taxista.setEmail(taxistaDto.getEmail());
        taxista.setTelefono(taxistaDto.getTelefono());
        taxista.setContrasena(taxistaDto.getContrasena());
        return taxista;
    }
    
    // Métodos para Jornada
    public static JornadaDto toJornadaDto(Jornada jornada) {
        if (jornada == null) return null;
        JornadaDto jornadaDto = new JornadaDto();
        jornadaDto.setIdJornada(jornada.getIdJornada());
        jornadaDto.setFechaInicio(jornada.getFechaInicio());
        jornadaDto.setFechaFinal(jornada.getFechaFinal());
        jornadaDto.setEstado(jornada.getEstado());
        
        // Convertir Taxista si existe
        if (jornada.getTaxista() != null) {
            jornadaDto.setTaxista(toTaxistaDto(jornada.getTaxista()));
        }
        
        // Convertir Turnos si existen
        if (jornada.getTurnos() != null) {
            jornadaDto.setTurnos(jornada.getTurnos().stream()
                .map(DtoConverter::toTurnoDto)
                .collect(Collectors.toList()));
        }
        
        return jornadaDto;
    }
    
    public static Jornada toJornadaEntity(JornadaDto jornadaDto) {
        if (jornadaDto == null) return null;
        Jornada jornada = new Jornada();
        jornada.setIdJornada(jornadaDto.getIdJornada());
        jornada.setFechaInicio(jornadaDto.getFechaInicio());
        jornada.setFechaFinal(jornadaDto.getFechaFinal());
        jornada.setEstado(jornadaDto.getEstado());
        return jornada;
    }
}