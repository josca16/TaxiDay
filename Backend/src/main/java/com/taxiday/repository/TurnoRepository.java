// TurnoRepository.java
package com.taxiday.repository;

import com.taxiday.model.Turno;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TurnoRepository extends JpaRepository<Turno, Integer> {
  List<Turno> findByJornadaIdJornada(int idJornada);
}
