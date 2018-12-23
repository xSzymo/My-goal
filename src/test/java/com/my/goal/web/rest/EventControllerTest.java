package com.my.goal.web.rest;

import com.my.goal.MyGoalApp;
import com.my.goal.domain.Event;
import com.my.goal.domain.User;
import com.my.goal.repository.EventRepository;
import com.my.goal.repository.UserRepository;
import org.apache.commons.lang3.RandomStringUtils;
import org.assertj.core.internal.bytebuddy.utility.RandomString;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.Instant;

import static org.hamcrest.Matchers.containsString;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@RunWith(SpringRunner.class)
@SpringBootTest(classes = MyGoalApp.class)
public class EventControllerTest {
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private EventController eventController;
    @Autowired
    private UserRepository userRepository;

    private MockMvc restAuditMockMvc;
    private static final String SAMPLE_PRINCIPAL = "SAMPLE_PRINCIPAL";
    private static final String SAMPLE_USER = "test-user";

    @Before
    public void setUp() throws Exception {
        MockitoAnnotations.initMocks(this);
        userRepository.deleteAll();
        this.restAuditMockMvc = MockMvcBuilders.standaloneSetup(eventController).build();

        User user = new User();
        user.setLogin(SAMPLE_USER);
        user.setEmail("test-user@wp.pl");
        user.setPassword(RandomStringUtils.random(60));
        user.setActivated(true);
        userRepository.save(user);
    }

    @After
    public void tearDown() throws Exception {
        userRepository.deleteAll();
        eventRepository.deleteAll();
    }

    @Test
    @WithMockUser(SAMPLE_USER)
    public void createEvent() throws Exception {
        Event event = new Event();
        event.setEndDate(Instant.now());
        event.setName("test" + RandomString.make(40));

        restAuditMockMvc.perform(post("/api/goal/events/")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(event)))
            .andExpect(status().isOk());

        assertTrue(eventRepository.findByName(event.getName()).isPresent());
    }

    @Test
    @WithMockUser(SAMPLE_USER)
    public void deleteEvent() throws Exception {
        Event event = new Event();
        event.setEndDate(Instant.now());
        event.setName("test" + RandomString.make(40));
        eventRepository.save(event);

        restAuditMockMvc.perform(delete("/api/goal/events/" + event.getId()))
            .andExpect(status().isOk());

        assertFalse(eventRepository.findByName(event.getName()).isPresent());
    }

    @Test
    @WithMockUser(SAMPLE_USER)
    public void findAll_correct() throws Exception {
        Event event = new Event();
        event.setEndDate(Instant.now());
        event.setName("test");
        eventRepository.save(event);
        Event event1 = new Event();
        event1.setEndDate(Instant.now());
        event1.setName("test1");
        eventRepository.save(event1);

        restAuditMockMvc.perform(get("/api/goal/events" + "?to=2208988800"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(content().string(containsString(event.getId())))
            .andExpect(content().string(containsString(event1.getId())));
    }

    @Test
    @WithMockUser(SAMPLE_USER)
    public void find_correct() throws Exception {
        Event event = new Event();
        event.setEndDate(Instant.now());
        event.setName("test");
        eventRepository.save(event);

        restAuditMockMvc.perform(get("/api/goal/events/" + event.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(content().string(containsString(event.getId())));
    }
}
