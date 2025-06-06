// JornadaRepository.java
package com.taxiday.repository;

import com.taxiday.model.Jornada;
import com.taxiday.model.Jornada.EstadoJornada;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JornadaRepository extends JpaRepository<Jornada, Integer> {
  // Si quieres filtrar por taxista:
  List<Jornada> findByTaxistaIdTaxista(int idTaxista);
  List<Jornada> findByEstado(EstadoJornada estado);
}
