import { useEffect, useState } from "react";
import MemberChoseButton from "./memberChoseButton";
import supabase from "../utils/supabase";
import { useAuth } from "../context/AuthContext";

interface RosterCardProps {
  date: string;
}

const RosterCard = ({ date }: RosterCardProps) => {
  const { phoneNumber } = useAuth();
  const [selectedMembers, setSelectedMembers] = useState<
    { date: string; skillId: number; phoneNumber: number }[]
  >([]);
  const [skillMembers, setSkillMembers] = useState<{ [key: number]: number[] }>(
    {}
  );
  const [skillNames, setSkillNames] = useState<{ [key: number]: string }>({});
  const [memberNames, setMemberNames] = useState<{ [key: number]: string }>({});
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isPublished, setIsPublished] = useState<boolean>(false);

  const skillRow = (skillId: number, members: number[] | undefined) => {
    return (
      <div className="flex flex-row gap-2 mb-1" key={skillId}>
        {skillNames[skillId] || "Loading..."}:{" "}
        {(members || []).map((member) => (
          <MemberChoseButton
            key={`${skillId}-${member}`}
            phoneNumber={member}
            userName={memberNames[member] || "Loading..."}
            isSelected={selectedMembers.some(
              (selected) =>
                selected.skillId === skillId && selected.phoneNumber === member
            )}
            toggleSelection={() => toggleMemberSelection(skillId, member)}
          />
        ))}
      </div>
    );
  };

  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      try {
        // Fetch isAdmin status
        const { data: userData, error: userError } = await supabase
          .from("worship_profile_info")
          .select("isAdmin")
          .eq("phoneNumber", phoneNumber)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
          setIsAdmin(false);
        } else {
          setIsAdmin(userData?.isAdmin || false);
        }

        // Check if the date is published
        const { data: publishedData, error: publishedError } = await supabase
          .from("worship_roster_published")
          .select("date")
          .eq("date", date)
          .single();

        if (publishedError) {
          console.error("Error checking published status:", publishedError);
        } else {
          setIsPublished(!!publishedData);
        }

        // Load selected members if the date is published or the user is admin
        if (publishedData || userData?.isAdmin) {
          const { data: rosterData, error: rosterError } = await supabase
            .from("worship_roster")
            .select("date, phoneNumber, skillId")
            .eq("date", date);

          if (rosterError) {
            console.error("Error fetching existing roster:", rosterError);
          } else {
            setSelectedMembers(rosterData || []);
          }
        } else {
          setSelectedMembers([]); // Clear selection if not admin and not published
        }

        const [
          { data: membersData, error: membersError },
          { data: skillsData, error: skillsError },
        ] = await Promise.all([
          supabase
            .from("worship_availabilities")
            .select("phoneNumber, skillId")
            .eq("date", date),
          supabase.from("worship_skills").select("id, skillName"),
        ]);

        if (membersError || skillsError) {
          console.error("Error fetching data:", membersError || skillsError);
          return;
        }

        const skillMembersData = membersData.reduce(
          (acc: { [key: number]: number[] }, member) => {
            acc[member.skillId] = [
              ...(acc[member.skillId] || []),
              member.phoneNumber,
            ];
            return acc;
          },
          {}
        );

        const skillNamesData = skillsData.reduce(
          (acc: { [key: number]: string }, skill) => {
            acc[skill.id] = skill.skillName;
            return acc;
          },
          {}
        );

        setSkillMembers(skillMembersData);
        setSkillNames(skillNamesData);

        const phoneNumbers = Array.from(
          new Set(membersData.map((member) => member.phoneNumber))
        );

        const names = await fetchUserNames(phoneNumbers);
        setMemberNames(names);

      } catch (error) {
        console.error("Unexpected error fetching data:", error);
      }
    };

    checkAdminAndLoadData();
  }, [date, phoneNumber]);

  const fetchUserNames = async (phoneNumbers: number[]) => {
    const namesMap: { [key: number]: string } = {};
    try {
      const { data, error } = await supabase
        .from("worship_profile_info")
        .select("phoneNumber, userName")
        .in("phoneNumber", phoneNumbers);

      if (error) {
        console.error("Error fetching user names:", error);
        return namesMap;
      }

      data?.forEach((record) => {
        namesMap[record.phoneNumber] = record.userName;
      });
    } catch (error) {
      console.error("Unexpected error fetching user names:", error);
    }
    return namesMap;
  };

  const toggleMemberSelection = (skillId: number, phoneNumber: number) => {
    setSelectedMembers((prevSelected) => {
      const exists = prevSelected.find(
        (member) =>
          member.skillId === skillId && member.phoneNumber === phoneNumber
      );
      if (exists) {
        return prevSelected.filter(
          (member) =>
            !(member.skillId === skillId && member.phoneNumber === phoneNumber)
        );
      } else {
        return [...prevSelected, { skillId, phoneNumber, date }];
      }
    });
  };

  const handleAdd = async () => {
    console.log("Selected members:", selectedMembers);
    try {
      const { error: deleteError } = await supabase
        .from("worship_roster")
        .delete()
        .eq("date", date);

      if (deleteError) {
        console.error(
          "Error deleting existing entries from worship_roster:",
          deleteError
        );
        return;
      }

      const { data, error: insertError } = await supabase
        .from("worship_roster")
        .insert(selectedMembers);

      if (insertError) {
        console.error("Error inserting into worship_roster:", insertError);
      } else {
        console.log("Inserted rows:", data);
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  };

  const handlePublishToggle = async () => {
    try {
      if (isPublished) {
        // Unpublish logic
        const { error } = await supabase
          .from("worship_roster_published")
          .delete()
          .eq("date", date);

        if (error) {
          console.error("Error unpublishing roster:", error);
        } else {
          setIsPublished(false);
          console.log("Roster unpublished successfully.");
        }
      } else {
        // Publish logic
        const { error } = await supabase
          .from("worship_roster_published")
          .insert([{ date }]);

        if (error) {
          console.error("Error publishing roster:", error);
        } else {
          setIsPublished(true);
          console.log("Roster published successfully.");
        }
      }
    } catch (error) {
      console.error("Unexpected error toggling publish status:", error);
    }
  };

  return (
    <div className="w-full border rounded-lg p-4 my-2">
      <p className="text-lg font-bold ">{date}</p>
      {Object.keys(skillNames).map((skillId) =>
        skillRow(Number(skillId), skillMembers[Number(skillId)])
      )}
      {isAdmin && (
        <div className="flex flex-row gap-2">
          <button
            className="rounded-md border border-gray-300 px-2"
            onClick={handleAdd}
          >
            Save
          </button>
          <button
            className="rounded-md border border-gray-300 px-2"
            onClick={handlePublishToggle}
          >
            {isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      )}
    </div>
  );
};

export default RosterCard;
