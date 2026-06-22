import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import {
  getRevisionsDueToday,
  getUserStats,
  getActiveSyllabus,
} from "@/lib/supabase/queries/topics";

import TodayRevisions from "@/components/home/TodayRevisions";
import QuickModeButtons from "@/components/home/QuickModeButtons";
import AcademicSnapshot from "@/components/home/AcademicSnapshot";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  const first = name.split(" ")[0];

  if (hour < 12) return `Good morning, ${first}.`;
  if (hour < 17) return `Good afternoon, ${first}.`;

  return `Good evening, ${first}.`;
}

function getMotivationalSubtitle(
  rcsScore: number,
  studiedCount: number
): string {
  if (studiedCount === 0) {
    return "Let's begin. Study your first topic to start your revision journey.";
  }

  if (rcsScore >= 90) {
    return "Outstanding consistency. Keep the momentum going.";
  }

  if (rcsScore >= 75) {
    return "You're doing well. Stay consistent and the knowledge compounds.";
  }

  if (rcsScore >= 50) {
    return "Good progress. A few revisions today will make a real difference.";
  }

  return "Every revision you complete today strengthens your foundation.";
}

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/home");

  const userId = user.id;

  const [
    revisionsDue,
    userStats,
    syllabus,
  ] = await Promise.all([
    getRevisionsDueToday(userId),
    getUserStats(userId),
    getActiveSyllabus(userId),
  ]);

  const greeting = getGreeting(
    userStats.user?.full_name ??
      "Student"
  );

  const subtitle =
    getMotivationalSubtitle(
      userStats.user?.rcs_score ?? 0,
      userStats.studiedTopics
    );

  const {
    count: revisionsThisWeek,
  } = await supabase
    .from("revision_log")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte(
      "completed_at",
      new Date(
        Date.now() -
          7 * 86400000
      ).toISOString()
    );

  return (
    <div
      style={{
        padding:
          "40px 32px 64px",
        maxWidth: 1100,
        margin: "0 auto",
      }}
    >
      {/* Greeting */}
      <section
        style={{
          marginBottom: 40,
        }}
        className="animate-fade-in"
      >
        <h1
          style={{
            fontFamily:
              "Fraunces, Georgia, serif",
            fontSize:
              "clamp(26px, 4vw, 36px)",
            fontWeight: 400,
            color:
              "var(--text)",
            marginBottom: 8,
            lineHeight: 1.2,
          }}
        >
          {greeting}
        </h1>

        <p
          style={{
            color:
              "var(--text-2)",
            fontSize: 16,
            maxWidth: "52ch",
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>

        {(revisionsThisWeek ??
          0) > 0 && (
          <div
            style={{
              display:
                "inline-flex",
              alignItems:
                "center",
              gap: 8,
              marginTop: 16,
              padding:
                "7px 14px",
              background:
                "var(--green-50)",
              border:
                "1px solid var(--green-100)",
              borderRadius: 99,
              fontSize: 13,
              color:
                "var(--green-800)",
            }}
          >
            <span>🔄</span>

            <span>
              You revised{" "}
              <strong>
                {
                  revisionsThisWeek
                }
              </strong>{" "}
              this week.
            </span>
          </div>
        )}
      </section>

      {/* Main grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 340px",
          gap: 32,
        }}
      >
        {/* Left */}
        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: 32,
          }}
        >
          <section className="animate-slide-up">
            <p className="section-label">
              What would you
              like to do
              today?
            </p>

            <QuickModeButtons
              revisionsDue={
                revisionsDue
              }
            />
          </section>

          <section
            className="animate-slide-up"
            style={{
              animationDelay:
                "60ms",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "baseline",
                marginBottom: 16,
              }}
            >
              <p
                className="section-label"
                style={{
                  marginBottom: 0,
                }}
              >
                Today&apos;s
                revisions

                {revisionsDue.length >
                  0 && (
                  <span
                    style={{
                      marginLeft: 8,
                      background:
                        "var(--green-100)",
                      color:
                        "var(--green-800)",
                      padding:
                        "2px 8px",
                      borderRadius: 99,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    {
                      revisionsDue.length
                    }
                  </span>
                )}
              </p>

              {syllabus && (
                <a
                  href="/syllabus"
                  style={{
                    fontSize: 13,
                    color:
                      "var(--green-800)",
                  }}
                >
                  View all
                  topics →
                </a>
              )}
            </div>

            <TodayRevisions
              revisionsDue={
                revisionsDue
              }
            />
          </section>
        </div>

        {/* Right */}
        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: 24,
          }}
        >
          <section
            className="animate-slide-up"
            style={{
              animationDelay:
                "120ms",
            }}
          >
            <p className="section-label">
              Academic
              snapshot
            </p>

            <AcademicSnapshot
              rcsScore={
                userStats
                  .user
                  ?.rcs_score ??
                0
              }
              totalTopics={
                userStats.totalTopics
              }
              studiedTopics={
                userStats.studiedTopics
              }
              masteredTopics={
                userStats.masteredTopics
              }
              overdueCount={
                userStats.overdueCount
              }
              branch={
                userStats
                  .user
                  ?.branch ??
                ""
              }
            />
          </section>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="grid-template-columns: 1fr 340px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
