package com.taxiday.service;

import com.taxiday.model.Taxista;
import java.util.List;

public interface TaxistaService {
    Taxista crearTaxista(Taxista taxista);
    List<Taxista> listarTaxistas();
    Taxista buscarPorId(int id);
    Taxista buscarPorLicencia(String licencia);
    Taxista buscarPorEmail(String email);
    Taxista actualizarTaxista(int id, Taxista cambios);
    boolean borrarTaxista(int id);
}
