package com.onazaidi.config;

import com.onazaidi.category.entity.Category;
import com.onazaidi.category.repository.CategoryRepository;
import com.onazaidi.common.util.SlugUtil;
import com.onazaidi.destination.entity.Destination;
import com.onazaidi.destination.repository.DestinationRepository;
import com.onazaidi.experience.entity.Experience;
import com.onazaidi.experience.repository.ExperienceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@Order(2)
@Profile("!prod")
@RequiredArgsConstructor
public class DemoDataSeeder implements CommandLineRunner {

    private final DestinationRepository destinationRepository;
    private final ExperienceRepository experienceRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (destinationRepository.count() == 0) {
            seed("Serengeti", "Northern Tanzania", "Home of the great migration.");
            seed("Zanzibar", "Indian Ocean", "Spice island beaches and culture.");
            seed("Kilimanjaro", "Northern Tanzania", "Africa's highest peak.");
            seed("Ngorongoro", "Northern Tanzania", "The world's largest caldera.");
            seed("Tarangire", "Northern Tanzania", "Elephants and baobabs.");
        }

        if (experienceRepository.count() == 0) {
            seedExp("Wildlife Safari", "Game drives and wildlife encounters.");
            seedExp("Beach", "Coastal and island relaxation.");
            seedExp("Mountain Climbing", "High-altitude trekking.");
            seedExp("Cultural Tourism", "Local communities and traditions.");
            seedExp("Diving & Snorkeling", "Marine exploration.");
        }

        if (categoryRepository.count() == 0) {
            seedCat("Landscape", "Wide scenic views.");
            seedCat("Wildlife", "Animals in their natural habitat.");
            seedCat("Portrait", "People and culture.");
            seedCat("Aerial", "Drone and elevated photography.");
        }

        log.info("Demo data seeded.");
    }

    private void seed(String name, String region, String desc) {
        destinationRepository.save(Destination.builder()
                .name(name)
                .slug(SlugUtil.slugify(name))
                .region(region)
                .description(desc)
                .build());
    }

    private void seedExp(String name, String desc) {
        experienceRepository.save(Experience.builder()
                .name(name)
                .slug(SlugUtil.slugify(name))
                .description(desc)
                .build());
    }

    private void seedCat(String name, String desc) {
        categoryRepository.save(Category.builder()
                .name(name)
                .slug(SlugUtil.slugify(name))
                .description(desc)
                .build());
    }
}