<script>
document.addEventListener("DOMContentLoaded", async () => {

    try{

        const data = await Api.getSummary();

        const totalKg = Number(data.totalWeightKg || 0);
        const targetKg = Number(data.seasonTargetKg || 100);

        const percent = Math.min(
            (totalKg/targetKg)*100,
            100
        );

        document.getElementById("treeWeight").textContent =
            totalKg.toFixed(1)+" kg";

        document.getElementById("treePercent").textContent =
            percent.toFixed(1)+"%";

        document.getElementById("treeProgress").style.width =
            percent+"%";


        let stage = 1;

        if(percent>=20) stage=2;
        if(percent>=40) stage=3;
        if(percent>=60) stage=4;
        if(percent>=80) stage=5;

        document.getElementById("treeImage").src =
            `images/tree/tree-stage-${stage}.png`;

    }
    catch(err){
        console.error(err);
    }

});
</script>
