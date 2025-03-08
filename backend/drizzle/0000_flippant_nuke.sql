CREATE TYPE "public"."completions_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."srv_logs_level" AS ENUM('unspecific', 'info', 'warn', 'error');--> statement-breakpoint
CREATE TABLE "api_keys" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "api_keys_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"key" varchar(63) NOT NULL,
	"comment" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"revoked" boolean DEFAULT false NOT NULL,
	CONSTRAINT "api_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "completions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "completions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"api_key_id" integer NOT NULL,
	"upstream_id" integer,
	"model" varchar NOT NULL,
	"prompt" jsonb NOT NULL,
	"prompt_tokens" integer NOT NULL,
	"completion" jsonb NOT NULL,
	"completion_tokens" integer NOT NULL,
	"status" "completions_status" DEFAULT 'pending' NOT NULL,
	"ttft" integer NOT NULL,
	"duration" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL,
	"rating" real,
	CONSTRAINT "completions_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "srv_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "srv_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"related_api_key_id" integer,
	"related_upstream_id" integer,
	"related_completion_id" integer,
	"message" varchar NOT NULL,
	"level" "srv_logs_level" NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"acknowledged" boolean DEFAULT false NOT NULL,
	"ack_at" timestamp,
	CONSTRAINT "srv_logs_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "upstreams" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "upstreams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(63) NOT NULL,
	"url" varchar(255) NOT NULL,
	"model" varchar(63) NOT NULL,
	"api_key" varchar(255),
	"comment" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "completions" ADD CONSTRAINT "completions_api_key_id_api_keys_id_fk" FOREIGN KEY ("api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "completions" ADD CONSTRAINT "completions_upstream_id_upstreams_id_fk" FOREIGN KEY ("upstream_id") REFERENCES "public"."upstreams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srv_logs" ADD CONSTRAINT "srv_logs_related_api_key_id_api_keys_id_fk" FOREIGN KEY ("related_api_key_id") REFERENCES "public"."api_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srv_logs" ADD CONSTRAINT "srv_logs_related_upstream_id_upstreams_id_fk" FOREIGN KEY ("related_upstream_id") REFERENCES "public"."upstreams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "srv_logs" ADD CONSTRAINT "srv_logs_related_completion_id_completions_id_fk" FOREIGN KEY ("related_completion_id") REFERENCES "public"."completions"("id") ON DELETE no action ON UPDATE no action;