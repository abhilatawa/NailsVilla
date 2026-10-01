package com.nailsvilla.appointments;

import java.time.Clock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Marks appointments COMPLETED once their end time has passed. Runs shortly after
 * startup and then every few minutes — on a host that sleeps when idle, the startup run
 * catches up on everything that ended while it was asleep.
 */
@Component
public class AppointmentCompletionJob {

    private static final Logger log = LoggerFactory.getLogger(AppointmentCompletionJob.class);

    private final AppointmentRepository appointmentRepository;
    private final Clock clock;

    public AppointmentCompletionJob(AppointmentRepository appointmentRepository, Clock clock) {
        this.appointmentRepository = appointmentRepository;
        this.clock = clock;
    }

    @Scheduled(initialDelayString = "PT10S", fixedDelayString = "PT5M")
    @Transactional
    public void completePastAppointments() {
        int completed = appointmentRepository.markEndedAsCompleted(
                AppointmentStatus.ACTIVE, AppointmentStatus.COMPLETED, clock.instant());
        if (completed > 0) {
            log.info("Marked {} past appointment(s) as completed", completed);
        }
    }
}
