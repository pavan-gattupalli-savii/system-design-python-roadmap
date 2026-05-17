import "dotenv/config";
import { sql } from "../src/db/client.js";

const oldUrls = [
  "https://baeldung.com/java-21-new-features",
  "https://baeldung.com/spring-boot-auto-configuration",
  "https://baeldung.com/spring-security-preauthorize",
  "https://baeldung.com/hibernate-batchsize",
  "https://baeldung.com/spring-data-jpa-bulk-insert",
  "https://baeldung.com/spring-boot-docker-compose",
  "https://baeldung.com/spring-boot-kubernetes",
  "https://baeldung.com/spring-cloud-aws",
  "https://java.testcontainers.org/frameworks/spring_boot/",
  "https://micrometer.io/docs/observation",
  "https://micrometer.io/docs/tracing",
  "https://bytebytego.com/courses/system-design-interview-vol-2",
  "https://refactoring.guru/solid",
  "https://realpython.com/python-tdd-introduction/",
];

const newUrls = [
  "https://www.baeldung.com/java-lts-21-new-features",
  "https://www.baeldung.com/spring-boot-custom-auto-configuration",
  "https://www.baeldung.com/spring-security-method-security",
  "https://www.baeldung.com/jpa-hibernate-batch-insert-update",
  "https://www.baeldung.com/spring-data-jpa-batch-inserts",
  "https://www.baeldung.com/docker-compose-support-spring-boot",
  "https://www.baeldung.com/spring-boot-minikube",
  "https://www.baeldung.com/spring-cloud-aws-s3",
  "https://docs.spring.io/spring-boot/reference/testing/testcontainers.html",
  "https://docs.micrometer.io/micrometer/reference/observation.html",
  "https://docs.micrometer.io/tracing/reference/index.html",
  "https://bytebytego.com/courses/system-design-interview/foreword",
  "https://www.digitalocean.com/community/conceptual-articles/s-o-l-i-d-the-first-five-principles-of-object-oriented-design",
  "https://realpython.com/courses/test-driven-development-pytest/",
];

async function main() {
  const oldStill = await sql`SELECT COUNT(*)::int AS n FROM roadmap_resources WHERE url = ANY(${oldUrls})` as unknown as Array<{ n: number }>;
  const newRows = await sql`SELECT COUNT(*)::int AS n FROM roadmap_resources WHERE url = ANY(${newUrls})` as unknown as Array<{ n: number }>;
  console.log("rows still on OLD urls:", oldStill[0].n);
  console.log("rows now on NEW urls :", newRows[0].n);
}
main().catch(e => { console.error(e); process.exit(1); });
