// JornadaRepository.java
package com.taxiday.repository;

import com.taxiday.model.Jornada;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JornadaRepository extends JpaRepository<Jornada, Integer> {
  // Si quieres filtrar por taxista:
  List<Jornada> findByTaxistaIdTaxista(int idTaxista);
}
