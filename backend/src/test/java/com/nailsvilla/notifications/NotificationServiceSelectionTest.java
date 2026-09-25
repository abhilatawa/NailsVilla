package com.nailsvilla.notifications;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import java.time.Clock;
import org.junit.jupiter.api.Test;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.mail.javamail.JavaMailSender;

class NotificationServiceSelectionTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withBean(JavaMailSender.class, () -> mock(JavaMailSender.class))
            .withBean(NotificationRepository.class, () -> mock(NotificationRepository.class))
            .withBean(Clock.class, Clock::systemUTC)
            .withUserConfiguration(PropertiesConfig.class, LoggingNotificationService.class, SmtpNotificationService.class);

    @Test
    void usesLoggingServiceWhenNoSmtpUsername() {
        contextRunner.run(context -> assertThat(context.getBean(NotificationService.class))
                .isInstanceOf(LoggingNotificationService.class));
    }

    @Test
    void usesLoggingServiceWhenSmtpUsernameBlank() {
        contextRunner.withPropertyValues("spring.mail.username=")
                .run(context -> assertThat(context.getBean(NotificationService.class))
                        .isInstanceOf(LoggingNotificationService.class));
    }

    @Test
    void usesSmtpServiceWhenSmtpUsernameSet() {
        contextRunner.withPropertyValues("spring.mail.username=abc@smtp-brevo.com")
                .run(context -> assertThat(context.getBean(NotificationService.class))
                        .isInstanceOf(SmtpNotificationService.class));
    }

    @EnableConfigurationProperties(NotificationProperties.class)
    static class PropertiesConfig {
    }
}
