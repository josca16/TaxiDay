package com.taxiday.service.impl;

import com.taxiday.dto.JornadaDto;
import com.taxiday.dto.TaxistaDto;
import com.taxiday.model.Jornada;
import com.taxiday.model.Jornada.EstadoJornada;
import com.taxiday.model.Taxista;
import com.taxiday.repository.JornadaRepository;
import com.taxiday.service.JornadaService;
import com.taxiday.repository.TaxistaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@Service
public class JornadaServiceImpl implements JornadaService {

    private final JornadaRepository repo;
    private final TaxistaRepository taxistaRepo;

    public JornadaServiceImpl(JornadaRepository repo, TaxistaRepository taxistaRepo) {
        this.repo = repo;
        this.taxistaRepo = taxistaRepo;
    }

    private JornadaDto convertToDto(Jornada jornada) {
        if (jornada == null) return null;
        JornadaDto jornadaDto = new JornadaDto();
        jornadaDto.setIdJornada(jornada.getIdJornada());
        jornadaDto.setFechaInicio(jornada.getFechaInicio());
        jornadaDto.setFechaFinal(jornada.getFechaFinal());
        jornadaDto.setEstado(jornada.getEstado());
        if (jornada.getTaxista() != null) {
            TaxistaDto taxistaDto = new TaxistaDto();
            taxistaDto.setIdTaxista(jornada.getTaxista().getIdTaxista());
            taxistaDto.setLicencia(jornada.getTaxista().getLicencia());
            taxistaDto.setNombre(jornada.getTaxista().getNombre());
            taxistaDto.setApellidos(jornada.getTaxista().getApellidos());
            taxistaDto.setEmail(jornada.getTaxista().getEmail());
            taxistaDto.setTelefono(jornada.getTaxista().getTelefono());
            jornadaDto.setTaxista(taxistaDto);
        }
        return jornadaDto;
    }

    private Jornada convertToEntity(JornadaDto jornadaDto) {
        if (jornadaDto == null) return null;
        Jornada jornada = new Jornada();
        jornada.setFechaInicio(jornadaDto.getFechaInicio());
        jornada.setFechaFinal(jornadaDto.getFechaFinal());
        jornada.setEstado(jornadaDto.getEstado());
        if (jornadaDto.getTaxista() != null && jornadaDto.getTaxista().getIdTaxista() != 0) {
            Taxista taxista = taxistaRepo.findById(jornadaDto.getTaxista().getIdTaxista()).orElse(null);
            jornada.setTaxista(taxista);
        }
        return jornada;
    }

    @Override
    @Transactional
    public Jornada crearJornada(Jornada jornada) {
        // Verificar si ya existe una jornada activa
        List<Jornada> jornadasActivas = repo.findByEstado(EstadoJornada.activa);
        if (!jornadasActivas.isEmpty()) {
            throw new IllegalStateException("Ya existe una jornada activa. Debe cerrar la jornada actual antes de crear una nueva.");
        }

        jornada.setFechaInicio(LocalDateTime.now());
        jornada.setEstado(EstadoJornada.activa);
        return repo.save(jornada);
    }

    @Override
    public List<Jornada> listarJornadas() {
        return repo.findAll();
    }

    @Override
    public Optional<Jornada> buscarPorId(int id) {
        return repo.findById(id);
    }

    @Override
    @Transactional
    public Jornada actualizarJornada(int id, Jornada cambios) {
        return repo.findById(id).map(j -> {
            j.setFechaInicio(cambios.getFechaInicio());
            j.setFechaFinal(cambios.getFechaFinal());
            j.setEstado(cambios.getEstado());
            j.setTaxista(cambios.getTaxista());
            return repo.save(j);
        }).orElse(null);
    }

    @Override
    @Transactional
    public boolean borrarJornada(int id) {
        if (!repo.existsById(id)) return false;
        repo.deleteById(id);
        return true;
    }

    @Override
    @Transactional
    public Optional<Jornada> cerrarJornada(int id, Jornada datosCierre) {
        return repo.findById(id).map(jornada -> {
            if (jornada.getEstado() != EstadoJornada.activa) {
                throw new IllegalStateException("Solo se pueden cerrar jornadas activas");
            }
            jornada.setFechaFinal(datosCierre.getFechaFinal());
            jornada.setEstado(EstadoJornada.cerrada);
            return repo.save(jornada);
        });
    }
} 