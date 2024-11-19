import { WinstonTransport as AxiomTransport } from "@axiomhq/winston";
import { AXIOM_DATASET, AXIOM_ORG_ID, AXIOM_TOKEN, NODE_ENV } from "astro:env/server";
import winston from "winston";

export function createLogger() {
	const logger = winston.createLogger({
		level: "info",
		format: winston.format.combine(
			winston.format.errors({ stack: true }),
			winston.format.json(),
		),
		transports: [
			new AxiomTransport({
				dataset: AXIOM_DATASET,
				token: AXIOM_TOKEN,
				orgId: AXIOM_ORG_ID,
			}),
		],
	});

	if (NODE_ENV !== "production") {
		logger.add(new winston.transports.Console());
	}

	return logger;
}
